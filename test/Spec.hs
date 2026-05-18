{-# LANGUAGE DeriveGeneric       #-}
{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}

module Main where

import           Data.Aeson           (FromJSON, ToJSON, encode)
import qualified Data.ByteString.Lazy as BL
import           Data.Yaml            (ParseException, decodeFileEither)
import           GHC.Generics         (Generic)
import           System.Directory     (doesFileExist)
import           Test.Hspec

data Category = Category
  { name      :: String
  , questions :: [String]
  } deriving (Show, Eq, Generic)

instance FromJSON Category
instance ToJSON Category

data Prompts = Prompts
  { categories :: [Category]
  } deriving (Show, Eq, Generic)

instance FromJSON Prompts
instance ToJSON Prompts

loadPrompts :: IO Prompts
loadPrompts = do
  result <- decodeFileEither "data/prompts.yaml"
  case (result :: Either ParseException Prompts) of
    Left err -> error $ "Failed to load prompts: " ++ show err
    Right p  -> pure p

main :: IO ()
main = hspec $ do
  describe "Prompts YAML data" $ do
    it "data file exists" $ do
      exists <- doesFileExist "data/prompts.yaml"
      exists `shouldBe` True

    it "parses successfully" $ do
      result <- decodeFileEither "data/prompts.yaml"
      case (result :: Either ParseException Prompts) of
        Left err -> expectationFailure $ "YAML parse error: " ++ show err
        Right _  -> pure ()

    it "has at least 10 categories" $ do
      prompts <- loadPrompts
      length (categories prompts) `shouldSatisfy` (>= 10)

    it "all categories have non-empty names" $ do
      prompts <- loadPrompts
      mapM_ (\c -> name c `shouldNotBe` "") (categories prompts)

    it "all categories have at least one question" $ do
      prompts <- loadPrompts
      mapM_ (\c -> questions c `shouldSatisfy` (not . null)) (categories prompts)

    it "has at least 100 total questions" $ do
      prompts <- loadPrompts
      let total = sum $ map (length . questions) (categories prompts)
      total `shouldSatisfy` (>= 100)

    it "no duplicate questions" $ do
      prompts <- loadPrompts
      let allQs = concatMap questions (categories prompts)
          nub = foldr (\x acc -> if x `elem` acc then acc else x : acc) []
      length allQs `shouldBe` length (nub allQs)

    it "encodes to valid JSON" $ do
      prompts <- loadPrompts
      BL.length (encode prompts) `shouldSatisfy` (> 0)
