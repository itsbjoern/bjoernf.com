import os
import pathlib

PROJECT_ROOT = pathlib.Path(__file__).parent

def setup_paths(app):
  for path_name, path in app['config']['paths'].items():
    app['config']['paths'][path_name] = PROJECT_ROOT / path
    os.makedirs(PROJECT_ROOT / path, exist_ok=True)
