import pathlib
import os
import yaml
import functools


BASE_DIR = pathlib.Path(__file__).parent


def update_with_env(config):
  for key, val in os.environ.items():
    if key.startswith('API_'):
      path = key[4:].lower().split('_')
      if len(path) == 1:
        config[path[0]] = val
      else:
        interim = config.setdefault(path[0], {})
        for item in path[1:-1]:
          interim = interim.setdefault(item, {})
        interim[path[-1]] = val


class Config(dict):
  def __getitem__(self, key):
    if key in self:
      return self[key]
    if '.' in key:
      path = key.split('.')
      config = self
      for key in path:
        config = config.get(key, None)
        if config is None:
          raise KeyError()
      return config
    raise KeyError()


def get_config():
  config = {}
  config_file = BASE_DIR / 'default.yml'
  if os.path.exists(config_file):
    with open(config_file, 'r') as fh:
      config = yaml.load(fh)
  update_with_env(config)

  return Config(config)
