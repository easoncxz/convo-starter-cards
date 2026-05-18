{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs, ... }:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f: nixpkgs.lib.genAttrs supportedSystems (system:
        f { inherit system; pkgs = nixpkgs.legacyPackages.${system}; }
      );
    in {
      packages = forAllSystems ({ system, pkgs }:
        let
          hp = pkgs.haskellPackages;
          src = pkgs.lib.cleanSource ./.;
          siteBuilder = hp.callCabal2nix "convo-starter-cards" src {};
        in {
          site-builder = siteBuilder;

          site = pkgs.stdenv.mkDerivation {
            pname = "convo-starter-cards-site";
            version = "0.1.0";
            inherit src;
            nativeBuildInputs = [ siteBuilder ];
            buildPhase = ''
              site build
            '';
            installPhase = ''
              mkdir -p $out
              cp -r _site/* $out/
            '';
          };

          default = self.packages.${system}.site;
        }
      );

      devShells = forAllSystems ({ system, pkgs }:
        let hp = pkgs.haskellPackages;
        in {
          default = hp.shellFor {
            packages = p: [ (p.callCabal2nix "convo-starter-cards" ./. {}) ];
            nativeBuildInputs = with pkgs; [
              cabal-install
              netlify-cli
              gh
              opentofu
              nodejs
            ];
          };
        }
      );
    };
}
