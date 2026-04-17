import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideChevronLeft,
  lucideDatabase,
  lucideLayoutDashboard,
  lucidePencilRuler,
} from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmTabsImports } from "@spartan-ng/helm/tabs";

@Component({
  selector: "cv-forms-layout",
  templateUrl: "./form.layout.html",
  styleUrl: "./form.layout.scss",
  host: {
    class:
      "scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent",
  },
  viewProviders: [
    provideIcons({
      lucideLayoutDashboard,
      lucidePencilRuler,
      lucideChevronLeft,
      lucideDatabase,
    }),
  ],
  imports: [
    HlmTabsImports,
    RouterOutlet,
    HlmButton,
    NgIcon,
    RouterLink,
    RouterLinkActive,
  ],
})
export class FormLayout {
  protected readonly toolbarItems = [
    { label: "Overview", icon: "lucideLayoutDashboard", path: "overview" },
    { label: "Designer", icon: "lucidePencilRuler", path: "designer" },
    { label: "Data", icon: "lucideDatabase", path: "data" },
  ];
}
