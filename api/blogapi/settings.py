"""
Load configuration
"""
from typing import Union, Dict
import pathlib
import os
import yaml


BASE_DIR = pathlib.Path(__file__).parent


def update_with_env(config):
    for key, val in os.environ.items():
        if key.startswith('API_'):
            if val == 'true' or val == 'True':
                val = True
            elif val == 'false' or val == 'False':
                val = False

            path = key[4:].lower().split('_')
            if len(path) == 1:
                config[path[0]] = val
            else:
                interim = config.setdefault(path[0], {})
                for item in path[1:-1]:
                    interim = interim.setdefault(item, {})
                interim[path[-1]] = val


class Config(dict):
    def __getitem__(self, key: str) -> Union[str, int, Dict[str, Union[str, int]]]:
        if key in self:
            return super().__getitem__(key)
        if '.' in key:
            path = key.split('.')
            config = self
            for key in path:
                config = config.get(key, None)
                if config is None:
                    raise KeyError()
            return config
        raise KeyError()


def get_config() -> Config:
    config = {}
    config_file = BASE_DIR / 'default.yml'
    if os.path.exists(config_file):
        with open(config_file, 'r', encoding='utf-8') as fh:
            config = yaml.safe_load(fh)
    update_with_env(config)

    return Config(config)
