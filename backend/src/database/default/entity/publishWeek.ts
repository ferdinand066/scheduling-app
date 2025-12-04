import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class PublishWeek {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "date",
  })
  startDate: string;

  @Column({
    type: "date",
  })
  endDate: string;

  @CreateDateColumn({
    type: "timestamp",
  })
  createdAt: string;
}

