import pathlib
import os
import yaml


BASE_DIR = pathlib.Path(__file__).parent.parent
DEFAULT_CONFIG_PATH = BASE_DIR / 'config' / 'main.yaml'


def get_config():
  config = {}
  with open(DEFAULT_CONFIG_PATH, 'r') as fh:
    config = yaml.load(fh)

  return config
