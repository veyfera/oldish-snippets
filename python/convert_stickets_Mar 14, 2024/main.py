import requests
from urllib.parse import urlencode

import zipfile, os

import subprocess
import concurrent.futures

api_url = "https://cloud-api.yandex.net/v1/disk/public/resources/download?"
home_url = "https://disk.yandex.ru/d/V47MEP5hZ3U1kg."

folders = [
        "1369_12_Наклейки 3-D_3",
        "1388_12_Наклейки 3-D_3",
        "1388_2_Наклейки 3-D_1",
        "1388_6_Наклейки 3-D_2",
        ]

def create_collage(folder):
    #get download link
    final_url = api_url + urlencode(dict(public_key=home_url, path="/"+folder))
    response = requests.get(final_url)
    download_url = response.json()["href"]
    print(f"got {folder}'s download link")

    #download archive
    download_response = requests.get(download_url)

    #save archive
    tmp_dir = "tmp_dir"
    folder_dir = tmp_dir+"/"+folder

    if not os.path.exists(tmp_dir):
        os.mkdir(tmp_dir)
    with open(folder_dir+".zip", "wb") as f:
        f.write(download_response.content)
        print(f"saved {folder} archive")

    #unzip archive
    with zipfile.ZipFile(folder_dir+".zip", "r") as zip_ref:
        zip_ref.extractall(tmp_dir)
        print(f"unziped {folder} archive")

    #remove old Result.tif
    res_path = folder_dir+"/Result.tif"
    if os.path.exists(res_path):
        os.remove(res_path)

    #determine how many img's per row
    image_count = len(os.listdir(folder_dir))
    if image_count / 2 > 4:
        image_count = 4
    elif image_count > 4 :
        image_count /= 2

    #create Result.tif
    command = f"montage -geometry 192x192+0+0 -tile {image_count}x -border 24x28 -bordercolor white *.png Result.tif" 
    subprocess.call(command.split(" "), cwd=tmp_dir+"/"+folder)
    print(f"finished with 'Result.tif' for {folder}")


if __name__ == "__main__":
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(folders)) as executor:
        future_to_name = [executor.submit(create_collage, folder) for folder in folders]
