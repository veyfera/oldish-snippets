import { connect, StringCodec, JSONCodec } from "nats";

// create a codec
const sc = StringCodec();
const jc = JSONCodec();

export const receiveMarks = async (nc) => {
  // create a simple subscriber and iterate over messages
  // matching the subscription
  const sub = nc.subscribe("students.v1.graded");
  (async () => {
    for await (const m of sub) {
      console.log("\n---------------------------\n");
      console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
      const data = jc.decode(m.data).data;
      processMarks(nc, data);
    }
    console.log("subscription closed");
  })();
}

import { create as createStudent, findOne as findStudent } from "../controllers/student.controller.js";
import { findOrCreate as createSubject } from "../controllers/subject.controller.js";
import { create as createMark } from "../controllers/mark.controller.js";

export const processMarks = async (nc, data) => {
  let studentExists = await findStudent(data.personalCode);

  if (!studentExists) {
    const r = await nc.request("students.v1.get", jc.encode({ personalCode: data.personalCode }));
    const res = jc.decode(r.data).data;

    await createStudent(res);
    console.log("created new student");
  } else {
    console.log("this student is already in db");
  }
  const subjectId = await createSubject(data.subject);
  console.log("SUBJECT_ID: ", subjectId);
  await createMark({...data, subjectId: subjectId});
}
