import os
import json

import typing
from apispec import APISpec, BasePlugin
from apispec.yaml_utils import load_operations_from_docstring

from blogapi import routes, models

os.makedirs('spec', exist_ok=True)


class DocPlugin(BasePlugin):
    def init_spec(self, spec):
        self._spec = spec
        super(DocPlugin, self).init_spec(spec)
        self.openapi_major_version = spec.openapi_version.major

    def operation_helper(self, operations, func, **kwargs):
        """Operation helper that parses docstrings for operations. Adds a
        ``func`` parameter to `apispec.APISpec.path`.
        """
        doc_operations = load_operations_from_docstring(func.__doc__)
        # Apply conditional processing
        if self.openapi_major_version < 3:
            "...Mutating doc_operations for OpenAPI v2..."
        else:
            "...Mutating doc_operations for OpenAPI v3+..."
        operations.update(doc_operations)

    def schema_helper(self, name: str, _, model=None):
        schema = {
            'properties': {},
            'required': []
        }

        type_map = {
            'str': 'string',
            'int': 'number',
            'float': 'number',
            'datetime': 'number'
        }

        def get_property(annotation):
            arg = annotation
            if hasattr(annotation, '__args__'):
                arg = annotation.__args__[0]

            if hasattr(arg, '_name'):
                if arg._name == 'List':
                    return {'type': 'array', 'items': get_property(arg)}
            if hasattr(arg, '__name__'):
                resolved = type_map.get(arg.__name__)

                if not resolved:
                    ref = self._spec.components.__dict__[
                        'schemas'].get(arg.__name__)
                    if ref:
                        return {'$ref': f'#/components/schemas/{arg.__name__}' }

                if not resolved:
                    resolved = 'undefined'
                    print(arg.__name__)
                return {'type': resolved}

        for key in model.__required_keys__:
            schema['properties'][key] = get_property(
                model.__annotations__[key])
            schema['required'].append(key)

        for key in model.__optional_keys__:
            schema['properties'][key] = get_property(
                model.__annotations__[key])

        return schema


class Dummy:
    pass


def generate():
    spec = APISpec(
        title="Blogapi Spec",
        version="1.0.0",
        openapi_version="3.0.2",
        plugins=[DocPlugin()],
    )

    # Create paths
    dummy_request = Dummy()
    setattr(dummy_request, 'user', True)

    def add_route(route, func):
        if hasattr(func, '__wrapped__'):
            func = func.__wrapped__
        spec.path(path=route, func=func)

    methods = ['get', 'post', 'delete']
    dummy_router = Dummy()
    for method in methods:
        setattr(dummy_router, f'add_{method}', add_route)

    dummy_app = Dummy()
    setattr(dummy_app, 'router', dummy_router)

    routes.setup_routes(dummy_app)

    # Create schemas
    spec.components.schema("PostContent", {}, model=models.PostContent)
    spec.components.schema("Post", {}, model=models.Post)

    json_spec = dict(spec.to_dict())
    with open('spec/generated.json', 'w+') as fh:
        json.dump(json_spec, fh)

    print('Wrote spec.')


if __name__ == '__main__':
    generate()
