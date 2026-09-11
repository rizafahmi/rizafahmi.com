{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShellNoCC {
  buildInputs = with pkgs; [
    nodejs_22
  ];
}
