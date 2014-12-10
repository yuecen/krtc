#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import json
import argparse
import time, datetime

def load_month_json(year):
    path = 'data/' + str(year)
    files = os.listdir(path)
    try:
        files.remove('average.json')
        files.remove('orange_line_heatmap.json')
        files.remove('red_line_heatmap.json')
        files.remove('total_heatmap.json')
    except ValueError:
        pass
    return sorted(files)


def timestamp_month(month, year, line):
    path = 'data/' + str(year) + '/' + str(year) + str(month).zfill(2) + '.json'
    data = json.loads(open(path).read())
    tmp = {}
    for v in data:
        if 'mon_to_sun' in v:
            tmp.update({int(time.mktime(datetime.datetime.strptime(v['day'], '%Y/%m/%d').timetuple())):
                        int(v[line + '_people'])})        
        else:
            tmp.update({int(time.mktime(datetime.datetime.strptime(v['date'], '%Y/%m/%d').timetuple())):
                        int(v[line + '_people'])})
    return tmp


def save_heatmap(months, year):
    lines = ['red_line', 'orange_line', 'total']
    for line in lines:
        data = {}
        month = 1
        while month <= 12:
            try:
                data.update(timestamp_month(month, year, line))
            except:
                print 'Error on month ' + str(month)
            month += 1
        
        with open('data/' + str(year) + '/' + line + '_heatmap.json', 'w') as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
        json_file.close()


def run():
    parser = argparse.ArgumentParser(description='Print arguments')
    parser.add_argument("-y", "--year", help="set year")
    args = parser.parse_args()
    if args.year:
        year = args.year
    else:
        print 'Please give a year number.'
        return
    save_heatmap(load_month_json(year), year)


if __name__ == '__main__':
    run()
