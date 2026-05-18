{-# LANGUAGE DeriveGeneric       #-}
{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}

module Main where

import           Data.Aeson           (ToJSON, encode)
import qualified Data.ByteString.Lazy.Char8 as BL
import           Data.Yaml            (FromJSON, decodeFileEither)
import           GHC.Generics         (Generic)
import           Hakyll

data Category = Category
  { name      :: String
  , questions :: [String]
  } deriving (Show, Generic)

instance FromJSON Category
instance ToJSON Category

data Prompts = Prompts
  { categories :: [Category]
  } deriving (Show, Generic)

instance FromJSON Prompts
instance ToJSON Prompts

main :: IO ()
main = hakyll $ do
    match "css/*" $ do
        route idRoute
        compile compressCssCompiler

    match "js/*" $ do
        route idRoute
        compile copyFileCompiler

    -- Generate prompts.json from the YAML data
    create ["data/prompts.json"] $ do
        route idRoute
        compile $ do
            result <- unsafeCompiler $ decodeFileEither "data/prompts.yaml"
            let json = case result of
                    Left err -> error $ "Failed to parse YAML: " ++ show err
                    Right (prompts :: Prompts) -> BL.unpack (encode prompts)
            makeItem json

    match "templates/*" $ compile templateBodyCompiler

    create ["index.html"] $ do
        route idRoute
        compile $ do
            let ctx = defaultContext
            makeItem ""
                >>= loadAndApplyTemplate "templates/default.html" ctx
                >>= relativizeUrls
