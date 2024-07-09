import os
import boto3
import urllib3


def lambda_handler(event, context):
    bucket = os.environ.get("PHOTOS_BUCKET")

    s3 = boto3.client("s3")
    http = urllib3.PoolManager()

    images = event

    image_urls = []

    for image in images:
        url = image["url"]
        key = image["filename"]
        content_type = image["contentType"]

        s3.upload_fileobj(
            http.request("GET", url, preload_content=False),
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
