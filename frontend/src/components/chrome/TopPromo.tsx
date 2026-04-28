"use client";

import { useEffect, useState } from "react";
import { cmsApi, type CmsLayoutResponse } from "@/lib/api";
import { ChromeIcon } from "./Icon";

export function TopPromo() {
  const [settings, setSettings] = useState<CmsLayoutResponse["settings"] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    cmsApi.getLayout()
      .then((res) => {
        const raw = res.data as ({ data?: CmsLayoutResponse } & CmsLayoutResponse) | undefined;
        const layout: CmsLayoutResponse | undefined = raw?.data ?? raw;
        setSettings(layout?.settings ?? null);
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || settings?.show_top_bar !== true) {
    return null;
  }

  return (
    <div className="bg-[#0A1F44] text-[12px] text-[#C7D0E4]">
      <div className="mx-auto flex min-h-9 max-w-[1400px] items-center justify-between gap-4 px-4 py-2 sm:px-7">
        <div className="flex min-w-0 items-center gap-5 overflow-hidden">
          {settings.top_bar_shipping && (
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
              <ChromeIcon name="truck" size={13} />
              <span className="truncate">{settings.top_bar_shipping}</span>
            </span>
          )}
          {settings.top_bar_hours && (
            <span className="hidden items-center gap-1.5 whitespace-nowrap md:inline-flex">
              <ChromeIcon name="clock" size={13} />
              {settings.top_bar_hours}
            </span>
          )}
        </div>
        {settings.top_bar_phone && (
          <a href={`tel:${settings.top_bar_phone.replace(/\s+/g, "")}`} className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-white hover:text-[#FFC72C]">
            <ChromeIcon name="phone" size={13} />
            İletişim: {settings.top_bar_phone}
          </a>
        )}
      </div>
    </div>
  );
}
