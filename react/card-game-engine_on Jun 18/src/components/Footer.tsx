import Link from "next/link";

export default function Footer() {
    return (
      <footer>
        <Link href="contacts">
            Contact us
        </Link>
        <div className="copyright">
            Rect-engine © {new Date().getFullYear()}
        </div>
      </footer>
        )
}
