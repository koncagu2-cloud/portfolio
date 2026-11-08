"""Render the owner-approved resume. Requires Python reportlab and pypdf.
Run from any directory: python3 scripts/build-resume.py
The supplied original PDF in Documents is never modified.
"""
import json
from html import escape
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'docs/resume/content.json').read_text())
output = root / 'public/resume/suleyman-koncagul-resume.pdf'
styles = {
    'name': ParagraphStyle('Name', fontName='Helvetica-Bold', fontSize=21, leading=24, spaceAfter=3),
    'role': ParagraphStyle('Role', fontName='Helvetica', fontSize=12, leading=16, spaceAfter=5),
    'contact': ParagraphStyle('Contact', fontName='Helvetica', fontSize=9, leading=12, spaceAfter=2),
    'section': ParagraphStyle('Section', fontName='Helvetica-Bold', fontSize=10, leading=13, spaceBefore=11, spaceAfter=3),
    'title': ParagraphStyle('Title', fontName='Helvetica-Bold', fontSize=10.5, leading=14, spaceAfter=1),
    'meta': ParagraphStyle('Meta', fontName='Helvetica', fontSize=9.5, leading=12, spaceAfter=3, textColor=colors.HexColor('#444444')),
    'body': ParagraphStyle('Body', fontName='Helvetica', fontSize=10, leading=13.2, spaceAfter=3),
    'bullet': ParagraphStyle('Bullet', fontName='Helvetica', fontSize=10, leading=13.2, leftIndent=10, firstLineIndent=-9, spaceAfter=3),
}
flow = []
def add(text, style='body'):
    flow.append(Paragraph(text, styles[style]))
def section(text):
    add(text, 'section')
    flow.append(HRFlowable(width='100%', thickness=.45, color=colors.HexColor('#999999'), spaceAfter=5))
def bullets(items):
    for text in items: add('• ' + escape(text), 'bullet')
def link(url, label):
    return f'<a href="{escape(url, quote=True)}" color="#202020">{escape(label)}</a>'

add(escape(data['name']).upper(), 'name')
add(escape(data['role']), 'role')
add(escape(data['location']) + ' | ' + link('mailto:' + data['email'], data['email']), 'contact')
add(link(data['portfolio'], 'suleymankoncagul.com') + ' | ' + link(data['linkedIn'], 'linkedin.com/in/suleyman-koncagul-b3237b357'), 'contact')
section('SUMMARY')
add(escape(data['summary']))
section('EDUCATION')
e = data['education']
add(escape(e['institution']), 'title')
add(escape(e['degree']))
add(escape(e['graduation']), 'meta')
section('SELECTED DESIGN PROJECTS')
for i, project in enumerate(data['projects']):
    if i: flow.append(Spacer(1, 5))
    add(escape(project['name']), 'title')
    add(escape(project['context']), 'meta')
    bullets(project['bullets'])
section('EXPERIENCE')
e = data['experience']
add(escape(e['title']), 'title')
add(escape(e['organization']) + ' · ' + escape(e['location']) + ' | ' + escape(e['dates']), 'meta')
bullets(e['bullets'])
section('SKILLS')
for label, value in data['skills'].items(): add('<b>' + escape(label) + ':</b> ' + escape(value), 'body')

doc = SimpleDocTemplate(str(output), pagesize=letter, rightMargin=42, leftMargin=42, topMargin=32, bottomMargin=30,
                        title='Suleyman Koncagul - UX / Product Designer', author=data['name'], lang='en-US')
doc.build(flow)
r = PdfReader(output)
assert len(r.pages) == 1, f'Resume exceeds one page: {len(r.pages)}'
text = r.pages[0].extract_text()
assert e['title'] in text
assert data['education']['graduation'] in text
for prohibited in ('UX / Operations Intern', 'Pure Michigan', 'MSU Arts', '40 participants', 'implementation-ready'):
    assert prohibited not in text, prohibited
print(f'Created one-page resume: {output}')
