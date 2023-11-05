import os
import boto3
import urllib3

def lambda_handler(event, context):
    url= event["url"]
    bucket = os.environ.get('PHOTOS_BUCKET')
    key = event["filename"]

    s3=boto3.client('s3')
    http=urllib3.PoolManager()
    s3.upload_fileobj(http.request('GET', url,preload_content=False), bucket, key, ExtraArgs={'ACL':'public-read', 'ContentType': event["contentType"], 'Tagging':'meta=false'})
    
    return {
        "url": f'https://s3.eu-north-1.amazonaws.com/{bucket}/{key}'
    }