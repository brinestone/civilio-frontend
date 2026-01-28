import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BackingStoreFactory, ErrorMappings, Parsable, ParsableFactory, ParseNodeFactory, PrimitiveTypesForDeserialization, PrimitiveTypesForDeserializationType, RequestAdapter, RequestInformation, SerializationWriterFactory } from "@microsoft/kiota-abstractions";

@Injectable({ providedIn: null })
export class AngularHttpClientAdapter implements RequestAdapter {
	// private readonly apiUrl = select(apiUrl)
	// constructor() {
	// 	this.configService.
	// }
	getSerializationWriterFactory(): SerializationWriterFactory {
		throw new Error("Method not implemented.");
	}
	getParseNodeFactory(): ParseNodeFactory {
		throw new Error("Method not implemented.");
	}
	getBackingStoreFactory(): BackingStoreFactory {
		throw new Error("Method not implemented.");
	}
	send<ModelType extends Parsable>(requestInfo: RequestInformation, type: ParsableFactory<ModelType>, errorMappings: ErrorMappings | undefined): Promise<ModelType | undefined> {
		throw new Error("Method not implemented.");
	}
	sendCollection<ModelType extends Parsable>(requestInfo: RequestInformation, type: ParsableFactory<ModelType>, errorMappings: ErrorMappings | undefined): Promise<ModelType[] | undefined> {
		throw new Error("Method not implemented.");
	}
	sendCollectionOfPrimitive<ResponseType extends Exclude<PrimitiveTypesForDeserializationType, ArrayBuffer>>(requestInfo: RequestInformation, responseType: Exclude<PrimitiveTypesForDeserialization, "ArrayBuffer">, errorMappings: ErrorMappings | undefined): Promise<ResponseType[] | undefined> {
		throw new Error("Method not implemented.");
	}
	sendPrimitive<ResponseType extends PrimitiveTypesForDeserializationType>(requestInfo: RequestInformation, responseType: PrimitiveTypesForDeserialization, errorMappings: ErrorMappings | undefined): Promise<ResponseType | undefined> {
		throw new Error("Method not implemented.");
	}
	sendNoResponseContent(requestInfo: RequestInformation, errorMappings: ErrorMappings | undefined): Promise<void> {
		throw new Error("Method not implemented.");
	}
	sendEnum<EnumObject extends Record<string, unknown>>(requestInfo: RequestInformation, enumObject: EnumObject, errorMappings: ErrorMappings | undefined): Promise<EnumObject[keyof EnumObject] | undefined> {
		throw new Error("Method not implemented.");
	}
	sendCollectionOfEnum<EnumObject extends Record<string, unknown>>(requestInfo: RequestInformation, enumObject: EnumObject, errorMappings: ErrorMappings | undefined): Promise<EnumObject[keyof EnumObject][] | undefined> {
		throw new Error("Method not implemented.");
	}
	enableBackingStore(backingStoreFactory?: BackingStoreFactory): void {
		throw new Error("Method not implemented.");
	}
	convertToNativeRequest<T>(requestInfo: RequestInformation): Promise<T> {
		throw new Error("Method not implemented.");
	}
	baseUrl: string = '/';
	private readonly httpClient = inject(HttpClient);
}
