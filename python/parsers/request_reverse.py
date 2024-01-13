import requests
from bs4 import BeautifulSoup
import re
import json

def fetch_ip():
    url = "https://2ip.ru"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    ip = soup.find(id="d_clip_button")
    ip = ip.text.strip()
    print("ip: ", ip)
    return ip

def fetch_token():
    response = requests.get("https://www.maxmind.com/en/geoip2-precision-demo")
    cookies = response.cookies
    x_csrf_token = re.findall("window.MaxMind.X_CSRF_TOKEN = \"(.*)\";$", response.text, re.MULTILINE)[0]
    print("x_csrf_token: ", x_csrf_token)

    headers = {
        "authority": "www.maxmind.com",
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "origin": "https://www.maxmind.com",
        "referer": "https://www.maxmind.com/en/geoip2-precision-demo",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "x-csrf-token": x_csrf_token,
        "x-requested-with": "XMLHttpRequest",
    }

    response = requests.post("https://www.maxmind.com/en/geoip2/demo/token", cookies=cookies, headers=headers)
    token = response.json()["token"]
    print("Auth token: ", token)
    return token

def fetch_time_zone(ip, token):
    headers = {
        "authority": "geoip.maxmind.com",
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Bearer " + token,
        "origin": "https://www.maxmind.com",
        "referer": "https://www.maxmind.com/",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    }
    response = requests.get("https://geoip.maxmind.com/geoip/v2.1/city/{0}?demo=1".format(ip), headers=headers)
    time_zone = response.json()["location"]["time_zone"]
    print("time_zone: ", time_zone)
    return time_zone

def fetch_region_list(time_zone):
    matching_regions = []
    response = requests.get("https://gist.github.com/salkar/19df1918ee2aed6669e2")
    soup = BeautifulSoup(response.text, "html.parser")

    for link in soup.findAll("a"):
        if "Raw" in link.text:
            res = requests.get("https://gist.github.com/" + link["href"])
            regions = json.loads(res.text)
            print("all regions: ", regions)

    for region in regions:
        if region[1] == time_zone:
            matching_regions.append(region[0])

    return matching_regions

def save_result_to_file(time_zone, regions):
    with open("result.txt", "w") as res_file:
        res_file.write(time_zone + "\n")
        res_file.write(", ".join(regions))

if __name__ == "__main__":
    ip = fetch_ip()
    token = fetch_token()
    time_zone = fetch_time_zone(ip, token)
    regions = fetch_region_list(time_zone)
    save_result_to_file(time_zone, regions)
