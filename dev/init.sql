-- Create a table for use by Rosetta for temporarily saving strings.
-- Each row is defined by userid, stringkey, repository, and locale.
-- The function upsert_saved_translations is used to create a row if it doesn't exist, or update it if it does.

CREATE TABLE saved_translations (
    user_id bigint,
    stringkey varchar,
    repository varchar,
    locale varchar(8),
    stringvalue varchar(255) NOT NULL,
    timestamp timestamp NOT NULL,
    PRIMARY KEY (user_id, stringkey, repository, locale)
);

-- Modeled from code posted here: http://stackoverflow.com/questions/1109061/insert-on-duplicate-update-in-postgresql.
CREATE FUNCTION upsert_saved_translations(id bigint, key varchar, repo varchar, loc varchar, value varchar, ts timestamp) RETURNS VOID AS
$$
BEGIN
    LOOP
        -- First try to update the key.
        UPDATE saved_translations SET stringvalue = value, timestamp = ts WHERE user_id = id AND stringkey = key AND repository = repo AND locale = loc;
        IF found THEN
            RETURN;
        END IF;
        -- Not there, so try to insert the key.
        -- If someone else inserts the same key concurrently, we could get a unique-key failure.
        BEGIN
            INSERT INTO saved_translations VALUES (id, key, repo, loc, value, ts);
            RETURN;
        EXCEPTION WHEN unique_violation THEN
            -- Do nothing, and loop to try the UPDATE again.
        END;
    END LOOP;
END;
$$
LANGUAGE plpgsql;