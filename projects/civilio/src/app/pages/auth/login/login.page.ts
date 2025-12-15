import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';

@Component({
	selector: 'cv-login',
	imports: [
		HlmCardImports,
		HlmInput,
		HlmButton,
		TranslatePipe,
		FormsModule,
		HlmLabel
	],
	templateUrl: './login.page.html',
	styleUrl: './login.page.scss',
	hostDirectives: [HlmCard]
})
export class LoginPage {

}
