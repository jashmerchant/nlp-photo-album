import json
import datetime
import boto3
import requests
from requests_aws4auth import AWS4Auth
from elasticsearch import Elasticsearch, RequestsHttpConnection

headers = {"Content-Type": "application/json"}
host = 'https://search-photos-7rrijmxnpuvq47i64ujrruwely.us-east-1.es.amazonaws.com/'
region = 'us-east-1'
lex = boto3.client('lex-runtime', region_name=region)


def get_labels(query):
    response = lex.post_text(
        botName='SearchBot',
        botAlias='searchbot',
        userId="string",
        inputText=query
    )
    print("lex-response", response)

    labels = []
    if 'slots' not in response:
        print("No photo collection for query {}".format(query))
    else:
        print("slot: ", response['slots'])
        slot_val = response['slots']
        for key, value in slot_val.items():
            if value != None:
                labels.append(value)
    return labels


def get_photo_path(labels):
    es = Elasticsearch(
        [host],
        http_auth=("admin", "Admin@123"),
    )

    resp = []
    for key in labels:
        if (key is not None) and key != '':
            searchData = es.search({"query": {"match": {"labels": key}}})
            resp.append(searchData)
    output = []
    for r in resp:
        if 'hits' in r:
            for val in r['hits']['hits']:
                key = val['_source']['objectKey']
                if key not in output:
                    output.append('S3://jash-b2/'+key)
    print(output)
    return output


def lambda_handler(event, context):
    print('event : ', event)

    q1 = event["queryStringParameters"]['q']

    # if(q1 == "searchAudio" ):
    #     q1 = convert_speechtotext()

    print("q1:", q1)
    labels = get_labels(q1)
    print("labels", labels)

    if len(labels) != 0:
        img_paths = get_photo_path(labels)

    if not img_paths:
        return{
            'statusCode': 200,
            # "headers": {"Access-Control-Allow-Origin": "*"},
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            'body': json.dumps('No Results found')
        }
    else:
        return{
            'statusCode': 200,
            # 'headers': {"Access-Control-Allow-Origin": "*"},
            'headers': {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            'body': json.dumps({
                'imagePaths': img_paths,
                'userQuery': q1,
                'labels': labels,
            }),
            'isBase64Encoded': False
        }
