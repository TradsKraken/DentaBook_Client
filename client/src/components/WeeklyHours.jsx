import { useState } from "react";
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const week = [1, 2, 3, 4, 5, 6, 0];
const clock = (value) => {
  if (!value) return "Choose time";
  const [hour, minute] = value.split(":");
  return `${Number(hour) % 12 || 12}:${minute} ${Number(hour) >= 12 ? "PM" : "AM"}`;
};
export default function WeeklyHours({ dentist, timezone, save }) {
  const [hours, setHours] = useState(dentist.hours);
  const [rememberedDays, setRememberedDays] = useState({});
  const [selected, setSelected] = useState([]);
  const [opening, setOpening] = useState("");
  const [closing, setClosing] = useState("");
  const [hasBreak, setHasBreak] = useState(false);
  const [breakStart, setBreakStart] = useState("");
  const [breakEnd, setBreakEnd] = useState("");
  const [error, setError] = useState("");
  const [errorLocation, setErrorLocation] = useState("setup");
  const [notice, setNotice] = useState("");
  const [appliedDraft, setAppliedDraft] = useState(null);
  const draft = JSON.stringify([
    selected,
    opening,
    closing,
    hasBreak,
    breakStart,
    breakEnd,
  ]);
  function editDay(day, entries) {
    setHours((previous) => [
      ...previous.filter((h) => h.day !== day),
      ...entries.map((h) => ({ ...h, day })),
    ]);
    setError("");
    setNotice("");
  }
  function apply() {
    setErrorLocation("setup");
    setNotice("");
    if (!selected.length) return setError("Choose at least one working day.");
    if (!opening || !closing || opening >= closing)
      return setError("Choose an opening time and a later closing time.");
    if (
      hasBreak &&
      (!breakStart ||
        !breakEnd ||
        breakStart <= opening ||
        breakStart >= breakEnd ||
        breakEnd >= closing)
    )
      return setError(
        "The break must start after opening and end before closing.",
      );
    const periods = hasBreak
      ? [
          { start: opening, end: breakStart },
          { start: breakEnd, end: closing },
        ]
      : [{ start: opening, end: closing }];
    const updated = [
      ...hours.filter((h) => !selected.includes(h.day)),
      ...selected.flatMap((day) => periods.map((h) => ({ ...h, day }))),
    ];
    if (updated.length > 42)
      return setError("Use up to six work periods per day.");
    setHours(updated);
    setAppliedDraft(draft);
    setError("");
    setNotice("Hours added below. Check your week, then save.");
  }
  async function submit(e) {
    e.preventDefault();
    setErrorLocation("save");
    setError("");
    setNotice("");
    if (selected.length && (opening || closing) && draft !== appliedDraft) {
      return setError(
        "Apply the hours to your selected days before saving your week.",
      );
    }
    for (const day of week) {
      const periods = hours
        .filter((h) => h.day === day)
        .sort((a, b) => a.start.localeCompare(b.start));
      if (periods.some((h) => !h.start || !h.end || h.start >= h.end))
        return setError(
          `${days[day]}: choose a start time and a later end time.`,
        );
      if (periods.some((h, i) => i > 0 && h.start < periods[i - 1].end))
        return setError(
          `${days[day]}: working times overlap. Check the hours for this day.`,
        );
    }
    const saved = await save(`dentists/${dentist.id}/availability`, {
      hours,
    });
    if (!saved)
      setError(
        "Working hours could not be saved. Check the message above and try again.",
      );
  }
  return (
    <form className="hours-form" onSubmit={submit}>
      <h3>Working hours</h3>
      <p>
        Set when {dentist.full_name} sees patients each week. Patients can
        request visits during these hours. Times use {timezone}.
      </p>
      <h4>Choose days and times</h4>
      <details
        className="hours-quick-setup"
        open={dentist.hours.length === 0 ? true : undefined}
      >
        <summary>Set the same hours for several days</summary>
        <p>Choose days, enter the hours once, and apply them to your week.</p>
        <div className="form-actions">
          <button
            className="button secondary"
            type="button"
            onClick={() => setSelected([1, 2, 3, 4, 5])}
          >
            Monday–Friday
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={() => setSelected([...week])}
          >
            Every day
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={() => setSelected([])}
          >
            Clear days
          </button>
        </div>
        <div className="working-day-picker" aria-label="Days to apply hours">
          {week.map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={selected.includes(day)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, day]
                      : selected.filter((d) => d !== day),
                  )
                }
              />
              {days[day]}
            </label>
          ))}
        </div>
        <div className="working-times">
          <label className="field">
            Opening time
            <input
              type="time"
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
            />
          </label>
          <label className="field">
            Closing time
            <input
              type="time"
              value={closing}
              onChange={(e) => setClosing(e.target.value)}
            />
          </label>
        </div>
        <label className="working-check">
          <input
            type="checkbox"
            checked={hasBreak}
            onChange={(e) => setHasBreak(e.target.checked)}
          />
          Include a lunch break
        </label>
        {hasBreak && (
          <div className="working-times">
            <label className="field">
              Break starts
              <input
                type="time"
                value={breakStart}
                onChange={(e) => setBreakStart(e.target.value)}
              />
            </label>
            <label className="field">
              Break ends
              <input
                type="time"
                value={breakEnd}
                onChange={(e) => setBreakEnd(e.target.value)}
              />
            </label>
          </div>
        )}
        <p className="field-hint">
          Applying replaces the hours for the days you select. Save below when
          your week is ready.
        </p>
        <button className="button secondary" type="button" onClick={apply}>
          Apply hours to selected days
        </button>
      </details>
      {error && errorLocation === "setup" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <h4>Your week</h4>
      <p className="field-hint">
        Turn a day off when this dentist is unavailable. Open “Edit hours” to
        change a single day or add hours after a break. Changes take effect when
        you save.
      </p>
      <div className="working-week">
        {week.map((day) => {
          const periods = hours.filter((h) => h.day === day);
          return (
            <section
              className="working-day"
              key={day}
              aria-label={`${days[day]} working hours`}
            >
              <label className="working-check">
                <input
                  type="checkbox"
                  aria-label={`${days[day]} working`}
                  checked={periods.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      editDay(
                        day,
                        rememberedDays[day] || [
                          { start: opening, end: closing },
                        ],
                      );
                    } else {
                      setRememberedDays((previous) => ({
                        ...previous,
                        [day]: periods,
                      }));
                      editDay(day, []);
                    }
                  }}
                />
                <strong>{days[day]}</strong>
              </label>
              <p className="working-day-summary">
                {periods.length
                  ? periods
                      .map((h) => `${clock(h.start)} – ${clock(h.end)}`)
                      .join(" / ")
                  : "Day off"}
              </p>
              {periods.length > 0 && (
                <details>
                  <summary>Edit {days[day]} hours</summary>
                  {periods.map((h, i) => (
                    <div className="working-period" key={i}>
                      <div className="working-times">
                        <label className="field">
                          From
                          <input
                            type="time"
                            aria-label={`${days[day]} start ${i + 1}`}
                            value={h.start}
                            onChange={(e) =>
                              editDay(
                                day,
                                periods.map((p, j) =>
                                  i === j ? { ...p, start: e.target.value } : p,
                                ),
                              )
                            }
                          />
                        </label>
                        <label className="field">
                          Until
                          <input
                            type="time"
                            aria-label={`${days[day]} end ${i + 1}`}
                            value={h.end}
                            onChange={(e) =>
                              editDay(
                                day,
                                periods.map((p, j) =>
                                  i === j ? { ...p, end: e.target.value } : p,
                                ),
                              )
                            }
                          />
                        </label>
                      </div>
                      <button
                        className="button secondary"
                        type="button"
                        onClick={() =>
                          editDay(
                            day,
                            periods.filter((_, j) => j !== i),
                          )
                        }
                      >
                        Remove hours {i + 1}
                      </button>
                    </div>
                  ))}
                  <button
                    className="button secondary"
                    type="button"
                    disabled={periods.length >= 6 || hours.length >= 42}
                    onClick={() =>
                      editDay(day, [...periods, { start: "", end: "" }])
                    }
                  >
                    Add hours after a break
                  </button>
                </details>
              )}
            </section>
          );
        })}
      </div>
      {error && errorLocation === "save" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!hours.length && (
        <p className="notice">
          This dentist has no working hours. Patients cannot book them until you
          add and save hours.
        </p>
      )}
      <button className="button full" type="submit">
        Save working hours
      </button>
    </form>
  );
}
