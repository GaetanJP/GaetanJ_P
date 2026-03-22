#!/usr/bin/env python3
"""
build_resume.py
Reads resume.yaml → generates resume.tex → (optionally) compiles to resume.pdf.

Usage:
    python build_resume.py          # generate resume.tex only
    python build_resume.py --pdf    # generate resume.tex AND compile resume.pdf

The compiled PDF is written to the project root so GitHub Pages serves it
as a static asset. Add a "Download Resume" button pointing to resume.pdf.
"""

import yaml
import re
import sys
import shutil
import subprocess
from pathlib import Path

ROOT     = Path(__file__).parent
YAML_FILE = ROOT / "resume.yaml"
TEX_FILE  = ROOT / "resume.tex"
PDF_FILE  = ROOT / "resume.pdf"


# ── LaTeX helpers ─────────────────────────────────────────────────────────────

def tex(text: str) -> str:
    """Convert HTML bold/italic to LaTeX, then escape special LaTeX characters."""
    if not isinstance(text, str):
        text = str(text)

    # Convert HTML tags → temporary markers (before any escaping)
    text = re.sub(r"<strong>(.*?)</strong>", r"%%BOLD%%\1%%ENDBOLD%%",   text, flags=re.DOTALL)
    text = re.sub(r"<em>(.*?)</em>",         r"%%ITALIC%%\1%%ENDITALIC%%", text, flags=re.DOTALL)
    text = re.sub(r"<[^>]+>", "", text)  # strip any remaining HTML tags

    # Escape LaTeX special characters
    for char, repl in [
        ("\\", r"\textbackslash{}"),
        ("&",  r"\&"),
        ("%",  r"\%"),
        ("#",  r"\#"),
        ("$",  r"\$"),
        ("_",  r"\_"),
        ("{",  r"\{"),
        ("}",  r"\}"),
        ("^",  r"\^{}"),
        ("~",  r"\textasciitilde{}"),
    ]:
        text = text.replace(char, repl)

    # Unicode dashes → LaTeX dashes
    text = text.replace("—", "---").replace("–", "--")

    # Restore bold / italic
    text = text.replace("%%BOLD%%",      r"\textbf{").replace("%%ENDBOLD%%",   "}")
    text = text.replace("%%ITALIC%%",    r"\textit{").replace("%%ENDITALIC%%", "}")

    return text


def href(url: str, label: str) -> str:
    return rf"\href{{{url}}}{{\underline{{{label}}}}}"


# ── Section renderers ─────────────────────────────────────────────────────────

def render_header(data: dict) -> str:
    name     = tex(data.get("name", ""))
    phone    = tex(data.get("phone", ""))
    email    = data.get("email", "")
    location = tex(data.get("location", ""))

    socials  = data.get("socials", [])
    linkedin = next((s for s in socials if s.get("type") == "linkedin"), None)
    github   = next((s for s in socials if s.get("type") == "github"),   None)

    parts = []
    if phone:    parts.append(phone)
    if email:    parts.append(href(f"mailto:{email}", email))
    if linkedin: parts.append(href(linkedin["url"], linkedin["value"]))
    if github:   parts.append(href(github["url"],   github["value"]))
    if location: parts.append(location)

    return rf"""
\begin{{center}}
    \textbf{{\Huge \scshape {name}}} \\ \vspace{{4pt}}
    \small {" $|$ ".join(parts)}
\end{{center}}
"""


def render_education(education: list) -> str:
    if not education:
        return ""
    items = []
    for edu in education:
        school = tex(edu.get("school", ""))
        date   = tex(edu.get("date",   ""))
        degree = tex(edu.get("degree", ""))
        gpa    = edu.get("gpa")
        if gpa:
            degree += rf" \hfill \textit{{GPA: {gpa}}}"
        items.append(rf"""
  \resumeSubheading
    {{{school}}}{{{date}}}
    {{{degree}}}{{}}""")

    return r"""
%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart""" + "".join(items) + r"""
  \resumeSubHeadingListEnd
"""


def render_experience(experience: list) -> str:
    if not experience:
        return ""
    items = []
    for job in experience:
        role     = tex(job.get("role",     ""))
        company  = tex(job.get("company",  ""))
        location = tex(job.get("location", ""))
        date     = tex(job.get("date",     ""))
        bullets  = job.get("bullets", [])
        bullet_lines = "\n".join(
            rf"        \resumeItem{{{tex(b)}}}" for b in bullets
        )
        items.append(rf"""
    \resumeSubheading
      {{{role}}}{{{date}}}
      {{{company} --- {location}}}{{}}
      \resumeItemListStart
{bullet_lines}
      \resumeItemListEnd""")

    return r"""
%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart""" + "".join(items) + r"""
  \resumeSubHeadingListEnd
"""


def render_projects(projects: list) -> str:
    if not projects:
        return ""
    items = []
    for p in projects:
        name   = tex(p.get("name",  ""))
        role   = tex(p.get("role",  ""))
        date   = tex(p.get("date",  ""))
        desc   = tex(p.get("description", ""))
        tags   = ", ".join(p.get("tags", []))
        link   = p.get("link",   "")
        github = p.get("github", "")

        name_part = name
        if link and link != "#":
            name_part = href(link, name)
        if github and github != "#":
            name_part += rf" $|$ \emph{{\small{{{href(github, 'GitHub')}}}}}"

        items.append(rf"""
    \resumeProjectHeading
      {{\textbf{{{name_part}}} $|$ \emph{{\small{{{tex(tags)}}}}}}}{{{date} $\cdot$ {role}}}
      \resumeItemListStart
        \resumeItem{{{desc}}}
      \resumeItemListEnd""")

    return r"""
%-----------PROJECTS-----------
\section{Projects \& Outside Experience}
  \resumeSubHeadingListStart""" + "".join(items) + r"""
  \resumeSubHeadingListEnd
"""


def render_skills(skills: list) -> str:
    if not skills:
        return ""
    lines = "\n".join(
        rf"     \textbf{{{tex(g.get('category', ''))}}}:"
        rf" {', '.join(tex(s) for s in g.get('items', []))} \\"
        for g in skills
    )
    return rf"""
%-----------SKILLS-----------
\section{{Technical Skills}}
 \begin{{itemize}}[leftmargin=0.15in, label={{}}]
    \small\item{{
{lines}
    }}
 \end{{itemize}}
"""


# ── Document preamble / postamble ─────────────────────────────────────────────

PREAMBLE = r"""% Auto-generated by build_resume.py — edit resume.yaml, not this file.
%--------------------------------------------------------------------------
\documentclass[letterpaper,10.5pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage[usenames,dvipsnames]{color}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-0.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

%--- Custom commands ---
\newcommand{\resumeItem}[1]{\item\small{#1 \vspace{-2pt}}}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
  \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%--------------------------------------------------------------------------
\begin{document}
"""

POSTAMBLE = r"""
%--------------------------------------------------------------------------
\end{document}
"""


# ── Main ──────────────────────────────────────────────────────────────────────

def build_tex(data: dict) -> None:
    doc = (
        PREAMBLE
        + render_header(data)
        + render_education(data.get("education",   []))
        + render_experience(data.get("experience", []))
        + render_projects(data.get("projects",     []))
        + render_skills(data.get("skills",         []))
        + POSTAMBLE
    )
    TEX_FILE.write_text(doc, encoding="utf-8")
    print(f"  ✓  {TEX_FILE.name}")


def build_pdf() -> None:
    if not shutil.which("pdflatex"):
        print("  ✗  pdflatex not found.")
        print("     Install TeX Live (https://tug.org/texlive/) or MiKTeX, then re-run.")
        sys.exit(1)

    print("     Compiling PDF (2 passes)…")
    for _ in range(2):
        result = subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", TEX_FILE.name],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )

    if PDF_FILE.exists():
        print(f"  ✓  {PDF_FILE.name}  →  serve at /resume.pdf")
    else:
        print("  ✗  Compilation failed — check resume.log for details.")
        print(result.stdout[-3000:])
        sys.exit(1)


def main() -> None:
    print("\nbuild_resume")
    print("────────────")

    with open(YAML_FILE, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    build_tex(data)

    if "--pdf" in sys.argv:
        build_pdf()
        print()
        print("  Next steps:")
        print("   1. Commit resume.pdf to your repo")
        print("   2. GitHub Pages will serve it at /resume.pdf")
        print("   3. The Download Resume button on your site links to it automatically")
    else:
        print("     (run with --pdf to also compile resume.pdf)")

    print()


if __name__ == "__main__":
    main()
