#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import json
import argparse

def load_month_json(year):
    path = 'data/' + str(year)
    files = os.listdir(path)
    try:
        files.remove('average.json')
    except ValueError:
        pass
    return sorted(files)


def average_month(year, month):
    path = 'data/' + str(year) + '/' + str(year) + str(month).zfill(2) + '.json'
    data = json.loads(open(path).read())
    orange_line_people, red_line_people, total_people = 0, 0, 0
    for v in data:
        orange_line_people = orange_line_people + int(v['orange_line_people'])
        red_line_people = red_line_people + int(v['red_line_people'])
        total_people = total_people + int(v['total_people'])

    return ((orange_line_people, orange_line_people / len(data)),
           (red_line_people, red_line_people / len(data)),
           (total_people, total_people / len(data)))


def save_average_by_year(year):
    data = []
    month = 1
    while month <= 12:
        try:
            v = average_month(year, month)
            data.append({'year': year, 'month': month,
                         't_orange_line_people': v[0][0],
                         'a_orange_line_people': v[0][1],
                         't_red_line_people': v[1][0],
                         'a_red_line_people': v[1][1],
                         't_total_people': v[2][0],
                         'a_total_people': v[2][1]
                        })
        except:
            print 'Error on month ' + str(month)
        month += 1
    return data


def run():
    parser = argparse.ArgumentParser(description='Print argument')
    parser.add_argument("-y", "--year", help="set year")
    args = parser.parse_args()
    data = save_average_by_year(args.year)

    with open('data/' + args.year + '/average.json', 'w') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)
    json_file.close()


if __name__ == '__main__':
    run()
