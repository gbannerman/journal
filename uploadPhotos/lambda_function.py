import boto3
import urllib3

def lambda_handler(event, context):
    url= event["url"]
    bucket = 'lookbak.at-journal-images' #your s3 bucket
    key = event["filename"] #your desired s3 path or filename

    s3=boto3.client('s3')
    http=urllib3.PoolManager()
    s3.upload_fileobj(http.request('GET', url,preload_content=False), bucket, key, ExtraArgs={'ACL':'public-read', 'ContentType': event["contentType"]})
    
    return {
        "s3Url": f'https://s3.eu-north-1.amazonaws.com/{bucket}/{key}'
    }