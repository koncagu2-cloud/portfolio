import '../../styles/resume-design.css'

const PORTFOLIO_URL = 'https://suleymankoncagul.com/'
const GITHUB_URL = 'https://github.com/koncagu2-cloud'
const LINKEDIN_URL = 'https://www.linkedin.com/in/'

/**
 * Standalone résumé layout (from Resume-Design.html). White “paper” — safe for html2pdf (hex/rgb only).
 */
export function ResumeDesign() {
  return (
    <div className="resume-design">
      <main className="sheet">
        <div className="wrap">
          <header>
            <div>
              <h1 className="name">Suleyman Sah Doruk Koncagul</h1>
              <div className="title">UX / UI + Experience Designer • Experience Architecture (MSU ’26)</div>
              <div className="kpi" aria-label="Quick highlights">
                <div className="card">
                  <div className="label">Focus</div>
                  <div className="value">IA • accessibility • interaction</div>
                </div>
                <div className="card">
                  <div className="label">Build</div>
                  <div className="value">HTML/CSS • prototypes • components</div>
                </div>
              </div>
            </div>
            <div className="meta">
              East Lansing, MI<br />
              <a href="mailto:koncagu2@msu.edu">koncagu2@msu.edu</a>
              <br />
              <span className="note">LinkedIn:</span>{' '}
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer noopener">
                Profile
              </a>
              <br />
              <span className="note">Portfolio:</span>{' '}
              <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer noopener">
                koncagu2-cloud.github.io
              </a>
              <br />
              <span className="note">GitHub:</span>{' '}
              <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
                koncagu2-cloud
              </a>
            </div>
          </header>

          <section className="grid">
            <div>
              <section className="section">
                <h2 className="h">Profile</h2>
                <p>
                  UX/UI + Experience Designer focused on simplifying complex, high-information workflows into clear,
                  usable interfaces. Strengths in information architecture, interaction design, accessibility, and
                  Figma handoff with reusable components (web + product surfaces).
                </p>
              </section>

              <section className="section">
                <h2 className="h">Experience</h2>
                <div className="item">
                  <div className="row">
                    <div className="where">Getir Storehouse</div>
                    <div className="when">Jun 2023 – Aug 2024</div>
                  </div>
                  <div className="what">UX / Operations Intern • Çanakkale, Turkey</div>
                  <ul>
                    <li>
                      Studied fulfillment and operations workflows in a high-volume environment; identified usability
                      issues affecting speed and accuracy.
                    </li>
                    <li>
                      Mapped user flows and clarified internal dashboard navigation patterns to make frequent tasks
                      easier to find and complete.
                    </li>
                    <li>
                      Partnered with cross-functional stakeholders to translate findings into actionable UX
                      recommendations and clearer UI structure.
                    </li>
                  </ul>
                </div>
              </section>

              <section className="section">
                <h2 className="h">Selected Projects</h2>

                <div className="item">
                  <div className="row">
                    <div className="where">D2L Learning Platform Redesign</div>
                    <div className="when">UX / Product Design</div>
                  </div>
                  <ul>
                    <li>
                      Led end-to-end redesign of a complex LMS; analyzed behavior, mapped journeys, and restructured
                      navigation using IA.
                    </li>
                    <li>
                      Reduced cognitive load by simplifying assignment and content workflows; improved wayfinding
                      across high-information screens.
                    </li>
                    <li>
                      Built wireframes and high-fidelity prototypes in Figma; created reusable components and clear
                      specs for handoff.
                    </li>
                  </ul>
                </div>

                <div className="item">
                  <div className="row">
                    <div className="where">MSU Arts Website Redesign</div>
                    <div className="when">Accessibility & UX</div>
                  </div>
                  <ul>
                    <li>
                      Audited accessibility and navigation; redesigned structure with WCAG-aligned considerations to
                      improve readability and flow.
                    </li>
                    <li>
                      Improved content hierarchy and page organization to reduce friction and increase findability on a
                      content-driven site.
                    </li>
                  </ul>
                </div>

                <div className="item">
                  <div className="row">
                    <div className="where">Data Visualization Dashboard</div>
                    <div className="when">UX + Interactive Systems</div>
                  </div>
                  <ul>
                    <li>
                      Designed dashboard patterns for exploring complex datasets; emphasized hierarchy, filtering, and
                      progressive disclosure.
                    </li>
                    <li>
                      Prototyped core interaction models to support quick scanning plus deeper drill-down when needed.
                    </li>
                  </ul>
                </div>
              </section>
            </div>

            <aside className="aside">
              <section className="section">
                <h2 className="h">Education</h2>
                <div className="item">
                  <div className="row">
                    <div className="where">Michigan State University</div>
                    <div className="when">May 2026</div>
                  </div>
                  <div className="what">B.A. Experience Architecture (Expected)</div>
                </div>
              </section>

              <section className="section">
                <h2 className="h">Skills</h2>
                <div>
                  <span className="pill">User Research</span>
                  <span className="pill">Usability Testing</span>
                  <span className="pill">Information Architecture</span>
                  <span className="pill">User Flows</span>
                  <span className="pill">Wireframing</span>
                  <span className="pill">Prototyping</span>
                  <span className="pill">Interaction Design</span>
                  <span className="pill">Accessibility (WCAG)</span>
                  <span className="pill">Design Systems</span>
                  <span className="pill">Figma</span>
                  <span className="pill">FigJam</span>
                  <span className="pill">Adobe CC</span>
                  <span className="pill">HTML/CSS</span>
                  <span className="pill">JavaScript</span>
                </div>
                <p className="note" style={{ marginTop: 8 }}>
                  Strong interest in AI-driven products and simplifying complex, data-rich systems.
                </p>
              </section>

              <section className="section">
                <h2 className="h">Languages</h2>
                <p>Turkish (Native) • English (Professional) • German (Basic)</p>
              </section>

              <section className="section">
                <h2 className="h">Community Space UX Research</h2>
                <div className="item">
                  <div className="row">
                    <div className="where">Human-Centered Design</div>
                    <div className="when" />
                  </div>
                  <ul>
                    <li>
                      Conducted interviews and surveys; synthesized insights into opportunity areas and experience
                      recommendations.
                    </li>
                    <li>Developed concepts focused on accessibility, inclusivity, and engagement.</li>
                  </ul>
                </div>
              </section>
            </aside>
          </section>
        </div>
      </main>
    </div>
  )
}
