import sys
import datetime
import os
import csv
import json

MAX_ITEMS_LENGTH = 1000
encoding = "utf-8"

#default config
src_dir = "."
out_dir = "output4"
delimiter = ","
runner_type = "inventory"
has_header = True

def parse():
    csv_files = filter(lambda f:".csv" in f, os.listdir(src_dir))
    csv_file_counter = 0
    warnings = []

    for file in csv_files:
        csv_file_counter +=1
        print(file)
        with open(f"{src_dir}/{file}", encoding=encoding, newline="") as csvfile:
            csv_reader = csv.reader(csvfile, delimiter=delimiter, quotechar="\"")
            method_body = create_new_method_body()
            file_counter = 0
            item_counter = 0
            error_counter = 0

            if has_header:
                next(csv_reader)

            for row in csv_reader:
                print(row)
                item,error = validate_row(row)

                if error == None:
                    if item_counter == MAX_ITEMS_LENGTH:
                        save_to_file(method_body, f"output-{file_counter}")
                        method_body = create_new_method_body()
                        item_counter = 0
                        file_counter += 1
                    add_item(item, method_body)
                    item_counter += 1
                else:
                    warnings.append(f"{item} - {error}")
                    error_counter += 1
    if item_counter != 0:
        save_to_file(method_body, f"output-{file_counter}")
        file_counter += 1
    write_warning_to_log(warnings)
    print(f"\nprocessed {csv_file_counter} csv files")
    print(f"created {file_counter} json files")
    print(f"{error_counter} warnings!")


def create_new_method_body():
    if runner_type == "inventory":
        return {
                "id": "1251506945251332",
                "method": "inventoryUpdateBatch",
                "params": {"items": []},
                "jsonrpc": "2.0"
                }
    elif runner_type == "price":
        return {
                "id": "1251506945251332",
                "method": "price.updateBatch",
                "params": {"items": []},
                "jsonrpc": "2.0"
                }

def validate_row(row):
    fields = specs[runner_type]
    item = {}
    for i in range(len(fields)):
        if i+1>len(row):    #if number of collumns did not match
            if not "required" in fields[i].keys():
                return item, None
            item[f["name"]] = data
            return item,f"{f['name']} - not enough fields"
        f = fields[i]
        if "arg" in f.keys():   #if has additional arguments for validator function
            data,error = f["v_func"](row[i], f["arg"])
        elif "ex_pos" in f.keys():  #needs to combine few collumns (unit_ratio + unit_type)
            data,error = f["v_func"](row[i:])
        else:
            data,error = f["v_func"](row[i])

        if "nested" in f.keys():    #if nested structure in output format
            parent_name = f["nested"]
            if not parent_name in item.keys():  #if the parent 'node' is not there yet
                item[parent_name] = {};
            item[f["nested"]][f["name"]] = data
            if "duplicate" in f.keys():
               item[f["nested"]][f["duplicate"]] = data
        else:
            item[f["name"]] = data
            if "duplicate" in f.keys():
               item[f["nested"]][f["duplicate"]] = data
        if error != None:
            return item,f"{f['name']} - {error}"
    print(item)
    return item, None

def add_item(item, method_body):
    if runner_type == "inventory":
        method_body["params"]["items"].append(item)
    elif runner_type == "price":
        method_body["params"]["items"].append(item)

def save_to_file(data, filename):
    if not os.path.exists(out_dir):
        os.mkdir(out_dir)
    with open(f"{out_dir}/{filename}.json", "w") as write_file:
        json.dump(data, write_file, indent=4, ensure_ascii=False)

def write_warning_to_log(warnings):
    with open("warnings.log", "w") as warning_log:
        for warning in warnings:
            warning_log.write(warning+"\n")
        warning_log.close()

#validator funcitons
def validate_str(value, length):
    if len(value):
        return value[:length], None
    return value, "string format error"

def validate_int(value):
    if not value:
        return value, None
    try:
        return int(value), None
    except ValueError:
        return value, "integer format error"

def validate_datetime(value):
    try:
        datetime.datetime.fromisoformat(value)
        return value, None
    except ValueError:
        return value, "date format error"

def validate_bool(value, optional):
    if optional and not value:
        return value, None
    elif value in ["0", "1"]:
        return value, None
    elif value == "true":
        return 1, None
    elif value == "false":
        return 0, None
    else:
        return value, "boolean format error"

def validate_decimal(value, optional):
    if optional and not value:
        return value, None
    elif value.replace(".", "").isdecimal():
        return round(float(value), 4), None
    return value, "decimal format errror"

def convert_unit(value):
    value[1] = value[1] or 0
    print('value of unit: ', value)
    v = value[0]
    if v == "1":
        return {"items": value[1]}, None
    elif v == "10":
        return {"alc_volume": value[1]/10}, None
    elif v == "11":
        return {"alc_volume": value[1]/1000/10}, None
    elif v == "12":
        return {"alc_volume": value[1]}, None
    elif v == "20":
        return {"gross_weight": value[1]}, None
    elif v == "21":
        return {"gross_weight": value[1]/1000}, None
    elif v == "30":
        return {"length": value[1]}, None
    elif v == "31":
        return {"area": value[1]}, None
    return value, "unit format error"

def validate_list(value, optional):
    if optional and not value:
        return value, None
    else:
        return value.split("&&"),None
    return value, "list format error"

#runner specifications
inventory_spec = [
        {
            "name": "store_ext_id",
            "v_func": validate_str,
            "arg": 40,
            "required": True,
            },
        {
            "name": "price_ext_id",
            "v_func": validate_str,
            "arg": 40,
            "required": True,
            },
        {
            "name": "snapshot_datetime",
            "v_func": validate_datetime,
            "required": True,
            },
        {
            "name": "in_matrix",
            "v_func": validate_bool,
            "arg": True
            },
        {
            "name": "qty",
            "v_func": validate_decimal,
            "arg": False
            },
        {
            "name": "sell_price",
            "v_func": validate_decimal,
            "arg": True
            },
        {
            "name": "prime_cost",
            "v_func": validate_decimal,
            "arg": True
            },
        {
            "name": "min_stock_level",
            "v_func": validate_decimal,
            "arg": True
            },
        {
            "name": "stock_in_days",
            "v_func": validate_int,
            },
        {
            "name": "in_transit",
            "v_func": validate_decimal,
            "arg": True
            }
        ]

price_spec = [
        {
            "name": "name",
            "v_func": validate_str,
            "arg": 200,
            "required": True,
            },
        {
            "name": "categories",
            "v_func": validate_list,
            "arg": True,
            "nested": "params",
            },
        {
            "name": "price",
            "v_func": validate_decimal,
            "arg": True,
            "nested": "params",
            },
        {
            "name": "extid",
            "v_func": validate_str,
            "arg": 40,
            "nested": "params",
            "duplicate": "sku_id",  #required field is not there, so we need to fill it with sometihng similar
            "required": True,
            },
        {
            "name": "vat",
            "v_func": validate_decimal,
            "arg": True,
            "nested": "params",
            },
        {
            "name": "units",
            "v_func": convert_unit,
            "ex_pos": 1,
            "nested": "params",
            },
        ]

specs = {
        "inventory": inventory_spec,
        "price": price_spec,
        }

def show_help():
    print('''
    CSV Parser

    Usage example:
    csv-parser -t <runner_type> -h -s <src_dir> -o <output_dir>

    csv-parser -t inventory -h -s reports

    Options:

    -t runner type
        available runner types:
        - invertory
        - price

    -s sourse directory

    -o output directory

    -h has header
          ''')


if __name__ == "__main__":
    try:    #config from cli arguments
        runner_type = sys.argv[sys.argv.index("-t")+1]
        src_dir = sys.argv[sys.argv.index("-s")+1]
        has_header = bool("-h" in sys.argv)
        out_dir = sys.argv[sys.argv.index("-o")+1]
        print(runner_type, src_dir, has_header, out_dir)
    except:
        show_help()
        exit()
    parse()

