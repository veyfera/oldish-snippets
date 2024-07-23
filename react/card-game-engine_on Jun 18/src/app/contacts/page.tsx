export default function Contacts() {
  return (
    <>
        <form className="contacts-form">
        <h2>Contact us</h2>
        <input type="text" name="name" placeholder="Username..." />
        <input type="text" name="email" placeholder="Email..." />
        <input type="text" name="subject" placeholder="Subject..." />
        <textarea  name="message" cols={30} rows={10} maxLength={1000} placeholder="Message text..."></textarea>
        <button type="submit">Submit</button>
        </form>
    </>
  );
}
