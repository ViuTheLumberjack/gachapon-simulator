import ItemCard from './ItemCard.jsx';

export default function CollectionGrid({ items, collection }) {
  return (
    <section className="collection-section" aria-labelledby="collection-title">
      <div className="section-heading">
        <p className="eyebrow">Album</p>
        <h2 id="collection-title">Collection</h2>
      </div>
      <div className="collection-grid">
        {items.map((item) => (
          <ItemCard item={item} entry={collection[item.id]} key={item.id} />
        ))}
      </div>
    </section>
  );
}
