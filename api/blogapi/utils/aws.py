import os
import io
import boto3
from botocore.exceptions import ClientError
import mimetypes

class AWS():
  def __init__(self, access_key, secret_key):
    self.bucket = 'bjornf.dev-public'
    self.region = 'eu-west-2'

    self.access_key = access_key
    self.secret_key = secret_key

  def s3_get_client(self):
    return boto3.client('s3',
                        aws_access_key_id=self.access_key,
                        aws_secret_access_key=self.secret_key
                        )

  def s3_get_file_url(self, file_name, path=None):
    return f"https://s3.{self.region}.amazonaws.com/{self.bucket}/{path + '/' if path else ''}{file_name}"

  def s3_upload_file(self, file_name, byte_data, path=None):
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param byte_data: bytearray of the data to upload
    :param folder_path: folder to upload to
    :return: True if file was uploaded, else False
    """

    file_path = file_name
    if path:
      file_path = os.path.join(path, file_name)

    s3_client = self.s3_get_client()
    (content_type, enc) = mimetypes.guess_type(file_name)
    if not content_type:
      content_type = 'binary/octet-stream'

    try:
      response = s3_client.upload_fileobj(
        io.BytesIO(byte_data),
        self.bucket,
        file_path,
        ExtraArgs={'ContentType': content_type}
      )
    except ClientError as e:
      return None
    return self.s3_get_file_url(file_name, path)
