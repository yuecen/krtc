#!/usr/bin/python
# -*- coding: utf-8 -*-
import argparse
import json
import urllib
import re
import sys
reload(sys)
sys.setdefaultencoding('utf-8')


url = ''
proxy = ''

def file_name(saved_url):
    file_name = re.match(r'(?i).*/(.*)\.pdf$', saved_url)
    assert file_name != None, 'file name can be found.'
    return file_name.group(1)


def download_file(download_url, file_name):
    global proxy
    web_file = urllib.urlopen(download_url, proxies={'https': proxy})
    local_file = open(file_name + '.pdf', 'wb')
    local_file.write(web_file.read())
    web_file.close()
    local_file.close()


def data_extraction(filename):
    from pdfminer.pdfparser import PDFParser, PDFDocument
    from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
    from pdfminer.converter import PDFPageAggregator
    from pdfminer.layout import LAParams, LTTextBoxHorizontal

    doc = PDFDocument()
    parser = PDFParser(open(filename + '.pdf', 'rb'))
    parser.set_document(doc)
    doc.set_parser(parser)
    doc.initialize()

    if not doc.is_extractable:  
        raise PDFTextExtractionNotAllowed

    rsrcmgr = PDFResourceManager()
    laparams = LAParams()
    device = PDFPageAggregator(rsrcmgr, laparams=laparams)
    interpreter = PDFPageInterpreter(rsrcmgr, device)

    data_cols = {}
    day, mon_to_sun, red_line_people, orange_line_people, total_people = [], [], [], [], []
    for i, page in enumerate(doc.get_pages()):  
        interpreter.process_page(page)  
        layout = device.get_result()  
        for x in layout:
            if type(x) == LTTextBoxHorizontal:
                x = re.sub(r'\n\s*\n', '\n' , x.get_text()).strip()
                first_value = str(x.split('\n')[0])
                if first_value == '營運日':
                    day = x.split('\n')
                if first_value == '星期':
                    mon_to_sun = x.split('\n')
                if first_value == '紅線運量(人次)':
                    red_line_people = [v.strip() for v in x.replace(',','').split('\n')]
                if first_value == '橘線運量(人次)':
                    orange_line_people = [v.strip() for v in x.replace(',','').split('\n')]
                if first_value == '總運量(人次)':
                    total_people = [v.strip() for v in x.replace(',','').split('\n')]
    data_cols = {'day': day, 'mon_to_sun': mon_to_sun, 'red_line_people': red_line_people, 
                 'orange_line_people': orange_line_people, 'total_people': total_people}
    return data_cols


def save_json(table_data, file_name):
    day = table_data['day'][1:]
    mon_to_sun = table_data['mon_to_sun'][1:]
    red_line_people = table_data['red_line_people'][1:]
    orange_line_people = table_data['orange_line_people'][1:]
    total_people = table_data['total_people'][1:]

    data = []
    try:
        for i, d in enumerate(day):
            data.append({'day': day[i], 'mon_to_sun': mon_to_sun[i], 'red_line_people': red_line_people[i],
                         'orange_line_people': orange_line_people[i], 'total_people': total_people[i]})
            # for testing
            # print day[i], mon_to_sun[i], red_line_people[i], orange_line_people[i], total_people[i]
    except IndexError:
        pass
    with open(file_name + '.json', 'w') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)
    json_file.close()


def run():
    parser = argparse.ArgumentParser(description='Print argument')
    parser.add_argument("-p", "--proxy", help="set proxy")
    parser.add_argument("-l", "--url", help="set url of PDF")
    args = parser.parse_args()
    global proxy, url
    proxy, url = args.proxy, args.url

    filename = file_name(url)
    download_file(url, filename)
    save_json(data_extraction(filename), filename)


if __name__ == '__main__':
    run()
