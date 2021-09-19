import pathlib
import os
import yaml


BASE_DIR = pathlib.Path(__file__).parent.parent
DEFAULT_CONFIG_PATH = BASE_DIR / 'config'


def get_config(name='main.yaml'):
  config = {}
  with open(DEFAULT_CONFIG_PATH / name, 'r') as fh:
    config = yaml.load(fh)

  return config
