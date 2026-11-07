import Link from "next/link";
import "../styles/footer.css";

const footerLinks = [
  { href: "/omoss", label: "Om NORYA" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/kjopsvilkar", label: "Kjøpsvilkår" },
  { href: "/personvern", label: "Personvern" },
  { href: "/angrerett", label: "Angrerett" },
];

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p className="footer-text">
          © {new Date().getFullYear()} NORYA. Norsk håndverk, nøye utvalgt.
        </p>
        <nav className="footer-links" aria-label="Footer">
          {footerLinks.map(({ href, label }) => (
            <Link className="footer-link" href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}