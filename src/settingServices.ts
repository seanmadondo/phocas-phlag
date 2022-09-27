import { SettingDto, UserSettingDto } from "./types";
import { IApiClient } from "./utils";

interface IScopedSettingService<T extends SettingDto>
{
	create(value: Omit<T, "id">): Promise<void>;
	update(value: T): Promise<void>;
	getAll(): Promise<T[]>;
}

export class OrganisationSettingService implements IScopedSettingService<SettingDto>
{
	private client: IApiClient;

	constructor(client: IApiClient) {
		this.client = client;
	}

	async create(value: Omit<SettingDto, "id">): Promise<void> {
		await this.client.post(`/api/settings`, value);
	}

	async update(value: SettingDto): Promise<void> {
		await this.client.put(`/api/settings/${value.id}`, value);
	}

	async getAll(): Promise<SettingDto[]> {
		return await (await this.client.get<SettingDto[]>(`/api/settings`)).json();
	}
}

export class UserSettingService implements IScopedSettingService<UserSettingDto>
{
	private client: IApiClient;

	constructor(client: IApiClient) {
		this.client = client;
	}

	async create(value: Omit<UserSettingDto, "id">): Promise<void> {
		await this.client.put("/api/settings/user/setting", value);
	}

	async update(value: UserSettingDto): Promise<void> {
		await this.client.put("/api/settings/user/setting", value);
	}

	async getAll(): Promise<UserSettingDto[]> {
		return await (await this.client.get<UserSettingDto[]>("/api/settings/user/setting")).json();
	}
}