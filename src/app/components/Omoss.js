export default function OmOss() {
  return (
    <div className="omoss-container px-6 py-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-900 mb-8 tracking-tight font-poppins">
        Om Oss
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <img
          src="https://stunningoutdoors.com/wp-content/uploads/2020/07/Steigen-Norway-View.jpg"
          alt="Steigen landscape"
          className="rounded-xl shadow-md object-cover w-full h-[220px]"
        />
        <img
          src="https://www.fjordtours.com/globalassets/destinations/northern-norway/lofoten/lofoten-islands-norway.jpg"
          alt="Lofoten islands"
          className="rounded-xl shadow-md object-cover w-full h-[220px]"
        />
        <img
          src="https://woodbodo.com/wp-content/uploads/2023/06/bodoryggen-hike.jpg"
          alt="Bodøryggen ridge"
          className="rounded-xl shadow-md object-cover w-full h-[220px]"
        />
      </div>

      <p className="text-lg text-slate-700 leading-relaxed mb-6 font-poppins">
        Norland er et kreativt fellesskap dedikert til å styrke skapere i Nord-Norge. Vi tror på samarbeid, historiefortelling, og digitale verktøy som bringer mennesker sammen.
      </p>
      <p className="text-lg text-slate-700 leading-relaxed font-poppins">
        Vårt mål er å bygge broer mellom kunst, teknologi og lokalsamfunn. Hver skapende stemme fortjener en plattform — og vi ønsker å være den.
      </p>
    </div>
  );
}