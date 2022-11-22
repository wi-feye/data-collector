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

- MIN_DEVICES= minimum number of devices that a raw detection should have. If a request is detected from a number of devices smaller than this threshold is ignored
- WIFEYE_BASEURL_USER_MANAGER= wi-feye base url of user manager service
- WIFEYE_BASEURL_DATA_MANAGER= wi-feye base url of data manager service
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
It takes list of timeseries provided with timeseries function of zerynth_api and format them to a list of raw detections. In particular this function is able to fix a unique *fingerpreint_id* (that is than removed before the exportation) composed by *timestamp_device* and the *mac_address* (hashed with sha256 hash function) to assign it the list of devices that tracks this probe request. Devices are firstly collected and then it's kept the mean of rssi of each device for each raw detection. In the end are filtered all raw detections with number of devices greater or equal than e certain parameter **MIN_DEVICES** that can be set in .env file. The JSON structure of raw detections is:
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
The wifeye_api file contains the class to handle wi-feye rest api calls. One is the call created to retrieve users and buildings information to use **API-KEY** of users and **last_update** of buildings to filter data retrieved from Zerynth cloud. The json structure of *get_users* response should be (this is the data joined from the two calls done on backend services user-manager and data-manager to retrieve users and buildiongs):
```
[
    {
        id: 0,
        apik: "",
        buildings: [
            {
                id: 0,
                id_zerynth: '',
                last_update: '',
                sniffers: [
                    {
                        id: 100001,
                        id_zerynth: ''
                    },
                    {
                        id: 100002,
                        id_zerynth: ''
                    },
                    {
                        id: 100003,
                        id_zerynth: ''
                    },
                ]
            },
            ...
        ]
    },
    ...
]
```

Another function is *create_raws* that takes the list of raw detections described above and sends it to wi-feye db service. The api call to do this use the **POST** method and in the body has the list of raw detections while in the header it is used the following object:
```
{
    'Authorization': 'Bearer <API_KEY>',    # authorization key
    'Content-type': 'application/json'      # to specify body content type formatting
}
```
The authorization key (that is used in all of WifeyeApi class api calls) is useful to increase the safety of the service. In this way only the service with the correct <API_KEY> can send this request to the wi-feye db service.

### Controller
Provides the main method that aggregates all the previous files. With function *raws_transfer* the controller is able to retrieve users with associated workspaces from wifi-eye db, retrieve for each of these the associated timeseries that are formatted in raw detections and in the and to collect all of these information and send them to the wi-feye db. The json structure of the sended object is: 
```
[
    {
        "id": 0,
        "buildings": [
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