import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "oauth_clients" })
export class OAuthClient {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ name: "client_id", type: "text" })
  clientId!: string;

  @Column({ name: "client_secret_hash", type: "text", nullable: true })
  clientSecretHash!: string | null;

  @Column({ name: "redirect_uris", type: "text", array: true })
  redirectUris!: string[];

  @Column({ name: "allowed_scopes", type: "text", array: true })
  allowedScopes!: string[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}

