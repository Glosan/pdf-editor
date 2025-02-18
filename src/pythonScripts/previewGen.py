import reportbro
import json
import sys, uuid



# parsed_data = json.loads(data)


# report = reportbro.Report(parsed_data,{},True)

# print(report.generate_pdf())

def main(args):
    report_definition = sys.stdin.read()

    report_definition = json.loads(report_definition)
    data = json.loads(args[0])

    report = reportbro.Report(report_definition, data, True, additional_fonts=[{"value": "dejavusans", "filename": "editor/fonts/DejaVuSans.ttf"}, {"value": "purisa", "filename": "editor/fonts/Purisa.ttf"}, {"value": "freesans", "filename": "editor/fonts/FreeSans.ttf"}])
    pdf = report.generate_pdf()
    sys.stdout.buffer.write(pdf)
    
    print()
if __name__ == "__main__":
    main(sys.argv[1:])