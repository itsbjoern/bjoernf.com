"""
Utility to support AWS related functionality
"""
import mimetypes
import os
import io
import boto3
from botocore.exceptions import ClientError


class AWS():
    def __init__(self, access_key, secret_key):
        self.bucket = 'bjornf.dev-public'
        self.region = 'eu-west-2'

        self.cf_distribution = 'E16OOQSQGDXBD'

        self.access_key = access_key
        self.secret_key = secret_key

    def get_client(self, client_type):
        return boto3.client(client_type,
                            aws_access_key_id=self.access_key,
                            aws_secret_access_key=self.secret_key)

    def cloudfront_create_invalidation(self):
        client = self.get_client('cloudfront')
        client.create_invalidation(
            DistributionId=self.cf_distribution,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 4,
                    'Items': [
                        "/rss",
                        "/*",
                        "/static/*",
                        "/rss*"
                    ]
                },
                'CallerReference': 'string'
            }
        )

    def s3_get_file_url(self, file_name, path=None):
        return f"https://s3.{self.region}.amazonaws.com/{self.bucket}/{path + '/' if path else ''}{file_name}"

    def s3_upload_file(self, file_name, byte_data, path=None):
        """Upload a file to an S3 bucket

        Args:
            file_name: File to upload
            byte_data: bytearray of the data to upload
            folder_path: folder to upload to
        Returns:
            Optional(str): The uploaded file
        """

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
