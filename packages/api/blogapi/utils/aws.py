"""
Utility to support AWS related functionality
"""
from typing import Literal, Union, Optional
import mimetypes
import os
import io
import boto3
from botocore.exceptions import ClientError


class AWS():
    def __init__(self, access_key: str, secret_key: str):
        self.bucket: str = 'bjornf.dev-uploads'
        self.region: str = 'eu-west-2'

        self.cf_distribution: str = 'E16OOQSQGDXBD'

        self.access_key: str = access_key
        self.secret_key: str = secret_key

    def get_client(self, client_type: Union[Literal['s3'], Literal['cloudfront']]):
        return boto3.client(client_type,
                            aws_access_key_id=self.access_key,
                            aws_secret_access_key=self.secret_key)

    def cloudfront_create_invalidation(self):
        client = self.get_client('cloudfront')
        client.create_invalidation( # type: ignore
            DistributionId=self.cf_distribution,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 5,
                    'Items': [
                        "/rss",
                        "/*",
                        "/assets/*",
                        "/images/*",
                        "/rss*"
                    ]
                },
                'CallerReference': 'api-invalid-1'
            }
        )

    def s3_get_file_url(self, file_name: str, path: Optional[str]=None) -> str:
        return f"https://s3.{self.region}.amazonaws.com/{self.bucket}/{path + '/' if path else ''}{file_name}"

    def s3_upload_file(self, file_name: str, byte_data: bytes, path: Optional[str]=None) -> Optional[str]:
        file_path = file_name
        if path:
            file_path = os.path.join(path, file_name)

        s3_client = self.get_client('s3')
        (content_type, _encoding) = mimetypes.guess_type(file_name)
        if not content_type:
            content_type = 'binary/octet-stream'

        try:
            s3_client.upload_fileobj(
                io.BytesIO(byte_data),
                self.bucket,
                file_path,
                ExtraArgs={'ContentType': content_type}
            )
        except ClientError:
            return None
        return self.s3_get_file_url(file_name, path)
