from base64 import b64encode
import os
import boto3
import urllib3


def lambda_handler(event, context):
    bucket = os.environ.get("PHOTOS_BUCKET")
    immich_url = os.environ.get("IMMICH_BASE_URL")
    immich_api_key = os.environ.get("IMMICH_API_KEY")
    immich_basic_auth_user = os.environ.get("IMMICH_BASIC_AUTH_USER")
    immich_basic_auth_password = os.environ.get("IMMICH_BASIC_AUTH_PASSWORD")

    immich_basic_auth_credentials = b64encode(
        f"{immich_basic_auth_user}:{immich_basic_auth_password}".encode("utf-8")
    ).decode("utf-8")

    s3 = boto3.client("s3")
    http = urllib3.PoolManager()

    images = event

    image_urls = []

    for image in images:
        id = image["id"]
        key = image["filename"]
        content_type = image["contentType"]

        url = f"{immich_url}/api/assets/{id}/thumbnail?size=preview"
        s3.upload_fileobj(
            http.request(
                "GET",
                url,
                preload_content=False,
                headers={
                    "x-api-key": immich_api_key,
                    "Authorization": f"Basic {immich_basic_auth_credentials}",
                },
            ),
            bucket,
            key,
            ExtraArgs={
                "ACL": "public-read",
                "ContentType": content_type,
                "Tagging": "meta=false",
            },
        )
        image_urls.append(f"https://s3.eu-north-1.amazonaws.com/{bucket}/{key}")

    return {"urls": image_urls}
