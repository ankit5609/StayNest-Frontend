import { ChevronDown } from "lucide-react";
import { useState } from "react";
const RATINGS = [
    { label: "Any", value: undefined },
    { label: "3+", value: 3 },
    { label: "4+", value: 4 },
    { label: "4.5+", value: 4.5 },
    { label: "5", value: 5 },
];
const AMENITIES = [
    { label: "Wi-Fi", count: 186 },
    { label: "Pool", count: 152 },
    { label: "Breakfast Included", count: 123 },
    { label: "Free Cancellation", count: 198 },
    { label: "Spa", count: 98 },
];
const PROPERTY_TYPES = [
    { label: "Hotel", count: 212 },
    { label: "Resort", count: 156 },
];
function Section({ title, children, defaultOpen = true, }) {
    const [open, setOpen] = useState(defaultOpen);
    return (<section className="border-b border-border/60 pb-5 last:border-b-0 last:pb-0">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
          {title}
        </span>
        <ChevronDown className={[
            "h-4 w-4 text-muted-foreground transition-transform duration-300",
            open ? "" : "-rotate-90",
        ].join(" ")} aria-hidden/>
      </button>
      <div className={[
            "grid transition-all duration-300",
            open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}>
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </section>);
}
export function FilterSidebar({ value, onChange, onReset }) {
    const set = (k, v) => onChange({ ...value, [k]: v });
    const min = value.minPrice ?? 50;
    const max = value.maxPrice ?? 1000;
    return (<aside className="w-full space-y-6 rounded-3xl bg-card p-6 shadow-[0_10px_40px_-25px_rgba(17,26,19,0.2)] ring-1 ring-black/[0.04] lg:sticky lg:top-[240px]">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-ink">
          Filters
        </h3>
        <button type="button" onClick={onReset} className="text-[12px] text-accent underline-offset-4 transition hover:underline">
          Clear all
        </button>
      </div>

      <Section title="Price per night">
        <div className="space-y-4">
          <input type="range" min={0} max={1000} step={10} value={max} onChange={(e) => set("maxPrice", Number(e.target.value))} className="w-full accent-[color:var(--primary)]"/>
          <div className="flex justify-between text-[11.5px] text-muted-foreground">
            <span>${min}</span>
            <span>${max}+</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="rounded-xl border border-border bg-background px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Min
              </div>
              <input type="number" inputMode="numeric" placeholder="$50" value={value.minPrice ?? ""} onChange={(e) => set("minPrice", e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-transparent text-[13px] font-medium text-ink focus:outline-none"/>
            </label>
            <label className="rounded-xl border border-border bg-background px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Max
              </div>
              <input type="number" inputMode="numeric" placeholder="$1,000+" value={value.maxPrice ?? ""} onChange={(e) => set("maxPrice", e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-transparent text-[13px] font-medium text-ink focus:outline-none"/>
            </label>
          </div>
        </div>
      </Section>

      <Section title="Guest Rating">
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((r) => {
            const active = value.minRating === r.value;
            return (<button key={r.label} type="button" onClick={() => set("minRating", r.value)} className={[
                    "rounded-full border px-3.5 py-1.5 text-[12px] transition-colors",
                    active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-ink hover:border-primary",
                ].join(" ")}>
                {r.label}
              </button>);
        })}
        </div>
      </Section>

      <Section title="Amenities">
        <ul className="space-y-2.5">
          {AMENITIES.map((a) => (<li key={a.label} className="flex items-center justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-ink">
                <input type="checkbox" className="h-4 w-4 rounded border-border accent-[color:var(--primary)]"/>
                {a.label}
              </label>
              <span className="text-[11.5px] text-muted-foreground">
                {a.count}
              </span>
            </li>))}
        </ul>
        <button className="mt-3 text-[12px] font-medium text-accent hover:underline">
          Show more
        </button>
      </Section>

      <Section title="Property Type">
        <ul className="space-y-2.5">
          {PROPERTY_TYPES.map((p) => (<li key={p.label} className="flex items-center justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-ink">
                <input type="checkbox" className="h-4 w-4 rounded border-border accent-[color:var(--primary)]"/>
                {p.label}
              </label>
              <span className="text-[11.5px] text-muted-foreground">
                {p.count}
              </span>
            </li>))}
        </ul>
        <button className="mt-3 text-[12px] font-medium text-accent hover:underline">
          Show more
        </button>
      </Section>

      <button type="button" className="w-full rounded-full bg-primary px-5 py-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary-mid">
        Apply Filters
      </button>
    </aside>);
}
/** Sort select shown above the results grid (used by ResultsHeader). */
export const SORT_OPTIONS = [
    { value: "PRICE_ASC", label: "Price: Low to High" },
    { value: "PRICE_DESC", label: "Price: High to Low" },
    { value: "RATING_DESC", label: "Top Rated" },
];
