CREATE OR REPLACE FUNCTION jsonb_to_hstore(data JSONB) RETURNS HSTORE AS
$$
DECLARE
	_result HSTORE := ''::HSTORE;
	_kv     RECORD;
BEGIN
	FOR _kv IN SELECT key, value FROM jsonb_each_text(data)
		LOOP
			_result := _result || hstore(_kv.key, _kv.value);
		end loop;
	RETURN _result;
end;
$$ LANGUAGE plpgsql;
