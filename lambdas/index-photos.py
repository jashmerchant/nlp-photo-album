import json
import boto3
import datetime
from aws_requests_auth.aws_auth import AWSRequestsAuth
from elasticsearch import Elasticsearch, RequestsHttpConnection

s3Client = boto3.client('s3')


def lambda_handler(event, context):
    timeStamp = str(datetime.datetime.now())
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']

    # print(bucket)
    # print(key)

    response = s3Client.head_object(Bucket=bucket, Key=key)
    body = response['Body'].read()

    recogClient = boto3.client('rekognition')
    response = recogClient.detect_labels(
        Image={"Bytes": body}, MaxLabels=10, MinConfidence=70
    )

    labels = response['Labels']
    custom_labels = []
    for label in labels:
        custom_labels.append(label['Name'])

    a1 = {
        'objectKey': key,
        'bucket': bucket,
        'createdTimeStamp': timeStamp,
        'labels': custom_labels
    }
    print(a1)

    host = "search-photos-7rrijmxnpuvq47i64ujrruwely.us-east-1.es.amazonaws.com"

    # es_payload = json.dumps(format).encode("utf-8")
    awsauth = AWSRequestsAuth(aws_access_key='AKIAVXF7Q2MXVPXMZPRK',
                              aws_secret_access_key='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',
                              aws_host=host,
                              aws_region='us-east-1',
                              aws_service='es')

    esClient = Elasticsearch(
        hosts=[{'host': host, 'port': 443}],
        use_ssl=True,
        http_auth=awsauth,
        verify_certs=True,
        connection_class=RequestsHttpConnection)

    rez = esClient.index(index='photos', doc_type='photo', body=a1)

    print(rez)
