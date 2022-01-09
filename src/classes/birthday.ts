import { DocumentData, SnapshotOptions } from "firebase/firestore";

/**
 * Birthday of a Guild member
 */
export default class Birthday {
  /**
   * Creates new Birthday
   * @param {string} username - Username of Guild member
   * @param {number} month - Month of member's birthday
   * @param {number} day - Day of member's birthday
   */
  constructor(username: string, month: number, day: number) {
    (this.username = username), (this.month = month), (this.day = day);
  }

  username: string;
  month: number;
  day: number;

  /**
   * Converts Birthday to Firestore object
   * @param {Birthday} birthday - Birthday class object
   * @return {{}} - {username: string, month: number, day: number}
   */
  static toFirestore(birthday: Birthday): {
    username: string;
    month: number;
    day: number;
  } {
    return {
      username: birthday.username,
      month: birthday.month,
      day: birthday.day,
    };
  }

  /**
   * Converts Firestore object to Birthday
   * @param {DocumentData} snapshot - Snapshot of a Firestore document
   * @param {SnapshotOptions} options - Options for snapshot.data()
   * @return {Birthday} - Birthday class object
   */
  static fromFirestore(
    snapshot: DocumentData,
    options?: SnapshotOptions
  ): Birthday {
    const data = snapshot.data(options);
    return new Birthday(data.username, data.month, data.day);
  }
}
