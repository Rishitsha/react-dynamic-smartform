import { useState, useEffect } from "react";
import { SelectOption } from "./types";

const cache: Record<string, SelectOption[]> = {};

export function useOptions(
  staticOptions?: string[] | SelectOption[],
  url?: string
): { options: SelectOption[]; loading: boolean } {
  const [options, setOptions] = useState<SelectOption[]>(() => {
    if (staticOptions) return normalizeOptions(staticOptions);
    if (url && cache[url]) return cache[url];
    return [];
  });
  const [loading, setLoading] = useState<boolean>(!!url && !cache[url]);

  useEffect(() => {
    if (!url) return;
    if (cache[url]) {
      setOptions(cache[url]);
      return;
    }
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then((data: any) => {
        const normalized = Array.isArray(data) ? normalizeOptions(data) : [];
        cache[url] = normalized;
        setOptions(normalized);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [url]);

  return { options, loading };
}

export function normalizeOptions(opts: string[] | SelectOption[] | any[]): SelectOption[] {
  return opts.map((o: any) => {
    if (typeof o === "string") return { label: o, value: o };
    if (o.label && o.value) return o;
    // Common API shapes
    if (o.name && o.id) return { label: o.name, value: String(o.id) };
    if (o.title && o.id) return { label: o.title, value: String(o.id) };
    return { label: String(o), value: String(o) };
  });
}