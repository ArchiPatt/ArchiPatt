import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "authorization_codes" })
export class AuthorizationCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "text" })
  code!: string;

  @Index()
  @Column({ name: "client_id", type: "text" })
  clientId!: string;

  @Index()
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "redirect_uri", type: "text" })
  redirectUri!: string;

  @Column({ type: "text", array: true })
  scopes!: string[];

  @Column({ name: "code_challenge", type: "text" })
  codeChallenge!: string;

  @Column({ name: "code_challenge_method", type: "text" })
  codeChallengeMethod!: "S256";

  @Column({ name: "nonce", type: "text", nullable: true })
  nonce!: string | null;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt!: Date;

  @Column({ name: "consumed_at", type: "timestamptz", nullable: true })
  consumedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}

