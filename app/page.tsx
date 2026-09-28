export default function Home() {
  return <main className="home"><section className="hero"><div><p className="eyebrow">A December to remember</p>
    <h1>One little door.<br /><em>Traditions that bring us together.</em></h1>
    <p className="intro">Gather your favorite people for a season of stories, small kindnesses, and the traditions that make Christmas yours.</p>
    <a className="primary" href="/calendar">Make your calendar <span aria-hidden="true">→</span></a>
    </div>
    <figure className="advent-art">
      <img src="/brand/advent-calendar.webp" width="1200" height="1200" fetchPriority="high" alt="Mike and Christian open a numbered Advent calendar door to reveal a glowing golden star." />
      <figcaption>A new memory behind every door</figcaption>
    </figure>
  </section><section className="features" aria-label="Make it yours"><article><span>01 / YOUR PEOPLE</span><h2>Friends count as family.</h2><p>Invite a coworker or a cousin to your calendar. Make a calendar for the people you love.</p></article>
    <article><span>02 / YOUR TRADITIONS</span><h2>A Christmas that feels like you.</h2><p>Choose Christmas traditions, Nativity reflections, or both. Add your own readings and gatherings.</p></article>
    <article><span>03 / A LITTLE ANTICIPATION</span><h2>No peeking ahead.</h2><p>Doors open on their date, in your calendar’s timezone. Begin with Thanksgiving if you like.</p></article></section>
  </main>;
}
