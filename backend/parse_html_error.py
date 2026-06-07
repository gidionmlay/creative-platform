import re
with open("error.html", "r") as f:
    html = f.read()
    
m = re.search(r'<title>(.*?)</title>', html)
print("Title:", m.group(1) if m else "No title")

m = re.search(r'Exception Value:\s*</dt>\s*<dd><pre>(.*?)</pre>', html, re.DOTALL)
print("Exception Value:", m.group(1).strip() if m else "No Exception Value")

m = re.search(r'Exception Type:\s*</dt>\s*<dd>(.*?)</dd>', html, re.DOTALL)
print("Exception Type:", m.group(1).strip() if m else "No Exception Type")

