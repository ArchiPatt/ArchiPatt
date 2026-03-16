import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { ColorScheme } from "../enums/ColorScheme";

@Entity()
export class UserColorScheme {
  @PrimaryColumn({ type: "uuid" })
  userId!: string;

  @Column({ type: "text", default: ColorScheme.Auto })
  colorScheme!: ColorScheme;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
