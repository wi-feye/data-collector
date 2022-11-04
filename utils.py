import datetime
import pandas as pd 
import ast

time_col = "time"

class TimeException(Exception):
    pass

    """do analyse on the interval between start and end
    """
def time_interval(df, start=None, end=None):
    start = pd.to_datetime(start)
    end = pd.to_datetime(end)
    if  start > end:
        raise TimeException("start and end not properly defined")
    
    df1 = pd.to_datetime(df[time_col]) > start & pd.to_datetime(df[time_col]) < end
    return df[df1]


    """retrieve timestamp, mac and rssi from zerynth wifi sniffer
    """
def retrieve_probs(df):
    devices_id = df["device_id"].unique()
    per_device_dict = {}
    for device in devices:
        prob_req_df = pd.DataFrame()
        temp_df = df[df["device_id"] == devices_id]
        
        temp_row = {
            "time": [],
            "mac": [],
            "rssi": []
        }
        
        for row in  temp_df[["timestamp_device", "scans"]].to_numpy().tolist():
            scans = row[1]
            for l in ast.literal_eval(scans):
                temp_row["time"].append(row[0])  
                temp_row["mac"].append(l[3])
                temp_row["rssi"].append(l[4])
        
        # per ogni probe request dei device attaccargli il dataframe associato
        per_device_dict[device] = pd.DataFrame.from_dict(temp_row)
    return per_device_dict

df = pd.read_csv("Test4.csv")
devices = retrieve_probs(df)