# Data Collector

Service able to get data from *Zerynth cloud* through api call, format them and send to *wi-feye* database the formatted results.

## Files
    .
    ├── src
    │   ├── service
    │   │   ├── wifeye_api.js   # provides functions to wrap api call to get and send resources from wi-feye db
    │   │   ├── formatter.js    # provides function to format Zerynth data to the ones sended to wi-feye db
    │   │   └── zerynth_api.js  # provides functions to get data from Zerynth cloud
    │   ├── controller.js       # main application controller that provides high level functions
    │   └── index.js            # main js file
    ├── .env-test
    ├── Dockerfile
    ├── package.json
    └── README.md

## Prerequisite
- docker
- zerynth api auth key
- wi-feye api auth key

Before server running must be create a **.env** file with the same structure of *.env-test*. Missing files should be filled with:

<<<<<<< HEAD
- MIN_DEVICES= minimum number of devices that a fingerprint should have. If a request is detected from a number of devices smaller than this threshold is ignored
=======
- MIN_DEVICES= minimum number of devices that a position detection should have. If a request is detected from a number of devices smaller than this threshold is ignored
>>>>>>> c00233e29b8bb23422296a4396f9b5c0218c71c9
- WIFEYE_BASEURL_STORAGE= wi-feye base url where is hosted the db
- WIFEYE_API_KEY= wi-feye auth api key to send data to db service


## Build docker image
```
docker build . -t wifeye/data-collector
```

## Build and run with node
In this case prerequisites are:
- node
- npm

At the beginning launch command to install all libraries
```
npm install
```
The following command launch the service with cron-node that schedule the data collector with the pattern defined in *.env* file to the voice CRON_CONFIG
```
npm start
```

## Manipulation details
The three main parts of the data-collector are 
- zerynth_api
- formatter
- wifeye_api
- controller

### ZerynthApi
It is the class able to query from Zerynth cloud different information:

- workspaces: list of workspace that a user can have. To each workspace is assigned a list of devices. Workspace JSON structure is:
```
{
    "workspaces": [
        {
            "id": "",
            "name": "",
            "account_id": "",
            "description": "",
            "created_at": "",
            "services": [
                {
                    "service": "",
                    "status": "",
                    "message": ""
                },
                ...
            ]
        },
        ...
    ]
}
```
- devices: list of devices assigned to a single workspace. Its JSON structure is:
```
{
    "devices": [
        {
            "id": "",
            "name": "",
            "account_id": "",
            "fleet_id": "",
            "fleet_name": "",
            "workspace_id": "",
            "workspace_name": "",
            "created_at": "",
            "identities": [
                {
                    "dcn": "",
                    "expiry_date": "",
                    "revoked": false,
                    "created_at": ""
                }
            ],
            "is_connected": false,
            "last_connected_at": "",
            "last_disconnected_at": "",
            "last_ip_address": ""
        },
        ...
    ],
    "error": null
}
```
- timeseries: list of timeseries eitted from devices. The api call done to retrieve this list can be filtered with different parameters. In particular here is implemented the filter by device_ids and the pagination with parameters from and size. By default this service takes all the timeseries of all devices from the first one for a size of 100. The JSON structure of timeseries is:
```
{
    "result": [
        {
            "timestamp_device": "",
            "timestamp_in": "",
            "fleet_id": "",
            "device_id": "",
            "tag": "",
            "payload": {
                "ts": 0,
                "scans": [
                    [
                        0, 
                        0,
                        0,
                        "AA:AA:AA:AA:AA:AA",    # mac address
                        -78,                    # rssi
                        0,
                        0
                    ],
                    ...
                ],
                "sum_rssi": 0,
                "n_devices": 0
            }
        }
    ]
}
```
### Formatter
<<<<<<< HEAD
It takes list of timeseries provided with timeseries function of zerynth_api and format them to a list of fingerprints. In particular this function is able to fix a unique *fingerpreint_id* (that is than removed before the exportation) composed by *timestamp_device* and the *mac_address* (hashed with sha256 hash function) to assign it the list of devices that tracks this probe request. Devices are firstly collected and then it's kept the mean of rssi of each device for each fingerprint. In the end are filtered all fingerprints with number of devices greater or equal than e certain parameter **MIN_DEVICES** that can be set in .env file. The JSON structure of fingerprints is:
=======
It takes list of timeseries provided with timeseries function of zerynth_api and format them to a list of position detections. In particular this function is able to fix a unique *fingerpreint_id* (that is than removed before the exportation) composed by *timestamp_device* and the *mac_address* (hashed with sha256 hash function) to assign it the list of devices that tracks this probe request. Devices are firstly collected and then it's kept the mean of rssi of each device for each position detection. In the end are filtered all position detections with number of devices greater or equal than e certain parameter **MIN_DEVICES** that can be set in .env file. The JSON structure of position detections is:
>>>>>>> c00233e29b8bb23422296a4396f9b5c0218c71c9
```
[
    {
        "timestamp": "",
        "mac_hash": "",
        "devices": [
            {
                "device_id": "",
                "rssi": 0
            },
            ...
        ]
    },
    ...
]
```
### WifeyeApi
The wifeye_api file contains the class to handle wi-feye rest api calls. One is the call created to retrieve users and workspaces information to use **API-KEY** of users and **last_update** of workspaces to filter data retrieved from Zerynth cloud. The json structure of *get_users* response should be:
```
[
    {
        id: 0,
        apik: "",
        workspaces: [
            {
                id: 0,
                idz: '',
                last_update: '',
                devices: [
                    {
                        id: 0,
                        idz: ''
                    },
                    {
                        id: 100002,
                        idz: ''
                    },
                    {
                        id: 100003,
                        idz: ''
                    },
                ]
            },
            ...
        ]
    },
    ...
]
```

<<<<<<< HEAD
Another function is *create_fingerprints* that takes the list of fingerprints described above and sends it to wi-feye db service. The api call to do this use the **POST** method and in the body has the list of fingerprints while in the header it is used the following object:
=======
Another function is *create_position_detections* that takes the list of position detections described above and sends it to wi-feye db service. The api call to do this use the **POST** method and in the body has the list of position detections while in the header it is used the following object:
>>>>>>> c00233e29b8bb23422296a4396f9b5c0218c71c9
```
{
    'Authorization': 'Bearer <API_KEY>',    # authorization key
    'Content-type': 'application/json'      # to specify body content type formatting
}
```
The authorization key (that is used in all of WifeyeApi class api calls) is useful to increase the safety of the service. In this way only the service with the correct <API_KEY> can send this request to the wi-feye db service.

### Controller
<<<<<<< HEAD
Provides the main method that aggregates all the previous files. With function *fingerprints_transfer* the controller is able to retrieve users with associated workspaces from wifi-eye db, retrieve for each of these the associated timeseries that are formatted in fingerprints and in the and to collect all of these information and send them to the wi-feye db. The json structure of the sended object is: 
=======
Provides the main method that aggregates all the previous files. With function *position_detections_transfer* the controller is able to retrieve users with associated workspaces from wifi-eye db, retrieve for each of these the associated timeseries that are formatted in position detections and in the and to collect all of these information and send them to the wi-feye db. The json structure of the sended object is: 
>>>>>>> c00233e29b8bb23422296a4396f9b5c0218c71c9
```
[
    {
        "id": 0,
        "workspaces": [
            {
                "id": 0,
                "detections": [
                    {
                        "timestamp": "",
                        "mac_hash": "",
                        "devices": [
                            {
                                "id": 0,
                                "rssi": 0
                            },
                            {
                                "id": 1,
                                "rssi": 0
                            },
                            {
                                "id": 2,
                                "rssi": 0
                            }
                        ]
                    },
                    ...
                ]
            },
            ...
        ]
    }
]
```